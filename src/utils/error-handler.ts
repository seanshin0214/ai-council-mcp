/**
 * Comprehensive Error Handling with AI Model Fallback Strategies
 */

export class AICouncilError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AICouncilError';
  }
}

// AI 모델 에러 타입
export enum AIModelErrorType {
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
}

export interface AIModelError {
  model: string;
  type: AIModelErrorType;
  message: string;
  timestamp: number;
}

// Fallback 전략
export class ModelFallbackStrategy {
  private errorLog: AIModelError[] = [];
  private readonly MAX_LOG_SIZE = 100;

  // 모델 우선순위 (비용 vs 성능 균형)
  private readonly modelPriority = {
    simple: ['gemini', 'gpt4', 'claude'],
    moderate: ['gpt4', 'gemini', 'claude'],
    complex: ['claude', 'gpt4', 'gemini'],
    expert: ['o1', 'claude', 'gpt4'],
    realtime: ['perplexity', 'gpt4', 'gemini'],
  };

  logError(error: AIModelError): void {
    this.errorLog.push(error);
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog.shift();
    }
    console.error(
      `🚨 AI Model Error: ${error.model} - ${error.type} - ${error.message}`
    );
  }

  getFallbackModel(
    failedModel: string,
    complexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'realtime'
  ): string | null {
    const priorities = this.modelPriority[complexity];
    const currentIndex = priorities.indexOf(failedModel);

    // 다음 우선순위 모델 반환
    if (currentIndex >= 0 && currentIndex < priorities.length - 1) {
      const nextModel = priorities[currentIndex + 1];
      console.log(`🔄 Fallback: ${failedModel} → ${nextModel}`);
      return nextModel;
    }

    // 모든 모델 실패
    console.error('❌ All models failed');
    return null;
  }

  getErrorStats(): {
    total: number;
    byModel: Record<string, number>;
    byType: Record<string, number>;
  } {
    const byModel: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const error of this.errorLog) {
      byModel[error.model] = (byModel[error.model] || 0) + 1;
      byType[error.type] = (byType[error.type] || 0) + 1;
    }

    return {
      total: this.errorLog.length,
      byModel,
      byType,
    };
  }
}

// Retry 전략 (Exponential Backoff)
export class RetryStrategy {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      timeout = 30000,
    } = options;

    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 적용
        const result = await this.withTimeout(fn(), timeout);
        return result;
      } catch (error) {
        lastError = error as Error;

        // 재시도 불가능한 에러는 즉시 throw
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // 마지막 시도였으면 throw
        if (attempt === maxRetries) {
          break;
        }

        console.warn(
          `⚠️ Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${lastError.message}`
        );

        // Exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw new AICouncilError(
      `Failed after ${maxRetries} retries: ${lastError?.message}`,
      'MAX_RETRIES_EXCEEDED',
      500,
      { lastError }
    );
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  private isNonRetryableError(error: any): boolean {
    // 400번대 에러는 재시도 불가
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return true;
    }

    // 인증 에러는 재시도 불가
    if (
      error.message?.includes('authentication') ||
      error.message?.includes('unauthorized')
    ) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 전역 에러 핸들러
export function handleMCPError(error: any): { error: string; code: string; details?: any } {
  console.error('❌ MCP Error:', error);

  // AICouncilError
  if (error instanceof AICouncilError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // OpenAI API 에러
  if (error.response?.data?.error) {
    return {
      error: error.response.data.error.message,
      code: 'OPENAI_API_ERROR',
      details: error.response.data.error,
    };
  }

  // Anthropic API 에러
  if (error.error?.type === 'api_error') {
    return {
      error: error.error.message,
      code: 'ANTHROPIC_API_ERROR',
    };
  }

  // Google API 에러
  if (error.message?.includes('GoogleGenerativeAI')) {
    return {
      error: error.message,
      code: 'GOOGLE_API_ERROR',
    };
  }

  // Perplexity API 에러
  if (error.message?.includes('Perplexity')) {
    return {
      error: error.message,
      code: 'PERPLEXITY_API_ERROR',
    };
  }

  // 데이터베이스 에러
  if (error.code === '23505') {
    // PostgreSQL unique violation
    return {
      error: 'Duplicate entry',
      code: 'DATABASE_DUPLICATE',
    };
  }

  // Redis 에러
  if (error.message?.includes('Redis')) {
    return {
      error: 'Cache service unavailable',
      code: 'REDIS_ERROR',
    };
  }

  // 일반 에러
  return {
    error: error.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
}

// Circuit Breaker 패턴
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1분
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit Breaker: HALF_OPEN');
      } else {
        throw new AICouncilError(
          'Circuit breaker is OPEN. Service temporarily unavailable.',
          'CIRCUIT_BREAKER_OPEN',
          503
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('✅ Circuit Breaker: CLOSED');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.error('🚨 Circuit Breaker: OPEN');
    }
  }

  getState(): string {
    return this.state;
  }
}
