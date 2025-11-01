import { register, Counter, Histogram, Gauge } from 'prom-client';

// Prometheus 메트릭 설정

// 1. 요청 카운터
export const requestCounter = new Counter({
  name: 'ai_council_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'endpoint', 'status'],
});

// 2. 응답 시간 히스토그램
export const responseTimeHistogram = new Histogram({
  name: 'ai_council_response_time_seconds',
  help: 'Response time in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// 3. AI 모델 사용 카운터
export const modelUsageCounter = new Counter({
  name: 'ai_council_model_usage_total',
  help: 'Total AI model invocations',
  labelNames: ['model', 'status'],
});

// 4. 토큰 사용량 카운터
export const tokenUsageCounter = new Counter({
  name: 'ai_council_tokens_used_total',
  help: 'Total tokens consumed',
  labelNames: ['model', 'type'], // type: prompt, completion
});

// 5. 캐시 히트/미스 카운터
export const cacheHitCounter = new Counter({
  name: 'ai_council_cache_hits_total',
  help: 'Total cache hits',
});

export const cacheMissCounter = new Counter({
  name: 'ai_council_cache_misses_total',
  help: 'Total cache misses',
});

// 6. 문서 카운터
export const documentsGauge = new Gauge({
  name: 'ai_council_documents_total',
  help: 'Total number of documents in database',
});

// 7. 활성 사용자 게이지
export const activeUsersGauge = new Gauge({
  name: 'ai_council_active_users',
  help: 'Number of active users',
});

// 8. 에러 카운터
export const errorCounter = new Counter({
  name: 'ai_council_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint'],
});

// 9. RAG 검색 성능
export const ragSearchHistogram = new Histogram({
  name: 'ai_council_rag_search_seconds',
  help: 'RAG vector search duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

// 메트릭 엔드포인트용 레지스터 반환
export function getMetricsRegistry() {
  return register;
}

// 메트릭 초기화 (서버 시작시 호출)
export async function initMetrics() {
  console.error('Prometheus metrics initialized');

  // 주기적으로 문서 수 업데이트 (예시)
  setInterval(async () => {
    try {
      // 실제로는 DB에서 조회
      // const count = await pool.query('SELECT COUNT(*) FROM documents');
      // documentsGauge.set(parseInt(count.rows[0].count));
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }, 60000); // 1분마다
}
