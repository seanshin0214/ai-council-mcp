import pg from 'pg';

const { Pool } = pg;

// PostgreSQL 연결 풀 생성
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'ai_council',
});

// 데이터베이스 스키마 초기화
export async function initDB() {
  const client = await pool.connect();

  try {
    // pgvector 확장 활성화
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');

    // 문서 저장 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 벡터 유사도 검색을 위한 인덱스
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx
      ON documents
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    // 사용자 테이블 (RBAC용)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('reader', 'writer', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 쿼리 로그 테이블 (모니터링용)
    await client.query(`
      CREATE TABLE IF NOT EXISTS query_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        query TEXT NOT NULL,
        model_used VARCHAR(100),
        response_time_ms INTEGER,
        tokens_used INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.error('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 데이터베이스 연결 테스트
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.error('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
