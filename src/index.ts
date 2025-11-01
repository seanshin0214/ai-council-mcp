import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { initDB, testConnection } from './db.js';
import { initRedis } from './redis.js';
import { upsertDocument, upsertMultipleDocuments } from './rag/upsert.js';
import { queryAthena } from './rag/athena.js';
import { analyzeQueryComplexity } from './router.js';
import { securityMiddleware } from './middleware/security.js';
import { authenticateAPIKey, requireRole, createUser, listUsers } from './middleware/auth.js';
import {
  getMetricsRegistry,
  initMetrics,
  requestCounter,
  responseTimeHistogram,
  modelUsageCounter,
} from './metrics.js';

const app = new Hono();

// Rate Limiter
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  limit: 100, // 최대 100 요청
  standardHeaders: 'draft-7',
  keyGenerator: (c: any) => c.req.header('X-API-Key') || 'anonymous',
});

// 전역 미들웨어
app.use('*', limiter);

// Health check (인증 불필요)
app.get('/health', (c) => c.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  services: {
    database: 'ok',
    redis: 'ok',
  }
}));

// Prometheus 메트릭 (인증 불필요)
app.get('/metrics', async (c) => {
  const metrics = await getMetricsRegistry().metrics();
  return c.text(metrics);
});

// === 인증 필요한 엔드포인트 ===

// RAG 쿼리 - Reader 이상
app.post('/query', authenticateAPIKey, requireRole('reader', 'writer', 'admin'), ...securityMiddleware(), async (c) => {
  const startTime = Date.now();

  try {
    const { query, model, useCache = true } = await c.req.json();

    if (!query) {
      requestCounter.inc({ method: 'POST', endpoint: '/query', status: '400' });
      return c.json({ error: 'Query is required' }, 400);
    }

    // 쿼리 복잡도 분석
    const analysis = analyzeQueryComplexity(query);
    const selectedModel = model || analysis.recommendedModel;

    // Athena로 쿼리 처리
    const result = await queryAthena(query, {
      model: selectedModel,
      useCache,
    });

    const duration = (Date.now() - startTime) / 1000;

    // 메트릭 기록
    requestCounter.inc({ method: 'POST', endpoint: '/query', status: '200' });
    responseTimeHistogram.observe({ method: 'POST', endpoint: '/query' }, duration);
    modelUsageCounter.inc({ model: selectedModel, status: 'success' });

    return c.json({
      ...result,
      metadata: {
        modelUsed: selectedModel,
        complexity: analysis.complexity,
        reasoning: analysis.reasoning,
        responseTime: `${duration.toFixed(2)}s`,
      },
    });
  } catch (error: any) {
    requestCounter.inc({ method: 'POST', endpoint: '/query', status: '500' });
    modelUsageCounter.inc({ model: 'unknown', status: 'error' });

    return c.json({
      error: 'Query processing failed',
      message: error.message,
    }, 500);
  }
});

// 문서 업로드 - Writer 이상
app.post('/documents', authenticateAPIKey, requireRole('writer', 'admin'), async (c) => {
  try {
    const { content, metadata } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const result = await upsertDocument(content, metadata);

    requestCounter.inc({ method: 'POST', endpoint: '/documents', status: '200' });

    return c.json(result);
  } catch (error: any) {
    requestCounter.inc({ method: 'POST', endpoint: '/documents', status: '500' });

    return c.json({
      error: 'Document upload failed',
      message: error.message,
    }, 500);
  }
});

// 다중 문서 업로드 - Writer 이상
app.post('/documents/batch', authenticateAPIKey, requireRole('writer', 'admin'), async (c) => {
  try {
    const { documents } = await c.req.json();

    if (!Array.isArray(documents)) {
      return c.json({ error: 'Documents must be an array' }, 400);
    }

    const result = await upsertMultipleDocuments(documents);

    return c.json(result);
  } catch (error: any) {
    return c.json({
      error: 'Batch upload failed',
      message: error.message,
    }, 500);
  }
});

// === Admin 전용 엔드포인트 ===

// 사용자 목록
app.get('/admin/users', authenticateAPIKey, requireRole('admin'), async (c) => {
  try {
    const users = await listUsers();
    return c.json({ users });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 사용자 생성
app.post('/admin/users', authenticateAPIKey, requireRole('admin'), async (c) => {
  try {
    const { username, role = 'reader' } = await c.req.json();

    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const apiKey = await createUser(username, role);

    return c.json({
      success: true,
      username,
      apiKey,
      role,
      message: 'User created successfully. Save this API key securely.',
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 서버 시작
async function startServer() {
  try {
    console.error('🚀 Starting AI Council MCP Server...\n');

    // 1. 데이터베이스 연결
    console.error('📊 Connecting to PostgreSQL...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // 2. 데이터베이스 스키마 초기화
    console.error('🗄️  Initializing database schema...');
    await initDB();

    // 3. Redis 연결
    console.error('🔴 Connecting to Redis...');
    await initRedis();

    // 4. Prometheus 메트릭 초기화
    console.error('📈 Initializing Prometheus metrics...');
    await initMetrics();

    // 5. 서버 시작
    const port = parseInt(process.env.PORT || '3000');

    console.error(`\n✅ Server ready on http://localhost:${port}`);
    console.error(`📊 Metrics: http://localhost:${port}/metrics`);
    console.error(`❤️  Health: http://localhost:${port}/health\n`);

    // Hono 서버 시작
    return {
      port,
      fetch: app.fetch,
    };
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 개발 모드에서 서버 시작
// Note: This check works in ES modules
const isMainModule = process.argv[1] && process.argv[1].includes('index');
if (isMainModule) {
  startServer().then(({ port }) => {
    console.error(`Listening on http://localhost:${port}`);
  });
}

export default app;
export { startServer };
