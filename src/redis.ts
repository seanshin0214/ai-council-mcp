import { createClient } from 'redis';

// Redis 클라이언트 생성
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.error('Redis Client Connected'));

// Redis 연결 초기화
export async function initRedis() {
  try {
    await redisClient.connect();
    console.error('Redis connection successful');
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
}

// 시맨틱 캐싱 헬퍼 함수들
export async function getCachedResponse(queryEmbedding: number[]): Promise<string | null> {
  try {
    // 임베딩을 문자열로 변환하여 키로 사용
    const key = `cache:${queryEmbedding.slice(0, 10).join(',')}`;
    const cached = await redisClient.get(key);
    return cached;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

export async function setCachedResponse(
  queryEmbedding: number[],
  response: string,
  ttl: number = 3600
): Promise<void> {
  try {
    const key = `cache:${queryEmbedding.slice(0, 10).join(',')}`;
    await redisClient.setEx(key, ttl, response);
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}
