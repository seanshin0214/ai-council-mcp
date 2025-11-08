/**
 * Error Handler Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ModelFallbackStrategy,
  RetryStrategy,
  CircuitBreaker,
  AIModelErrorType,
} from '../src/utils/error-handler';

describe('Model Fallback Strategy', () => {
  let strategy: ModelFallbackStrategy;

  beforeEach(() => {
    strategy = new ModelFallbackStrategy();
  });

  it('should provide fallback for simple queries', () => {
    const fallback = strategy.getFallbackModel('gemini', 'simple');
    expect(fallback).toBe('gpt4');
  });

  it('should provide fallback for complex queries', () => {
    const fallback = strategy.getFallbackModel('claude', 'complex');
    expect(fallback).toBe('gpt4');
  });

  it('should provide fallback for realtime queries', () => {
    const fallback = strategy.getFallbackModel('perplexity', 'realtime');
    expect(fallback).toBe('gpt4');
  });

  it('should return null when all models exhausted', () => {
    strategy.getFallbackModel('gemini', 'simple'); // gpt4
    const fallback = strategy.getFallbackModel('claude', 'simple'); // null
    expect(fallback).toBeNull();
  });

  it('should log errors', () => {
    strategy.logError({
      model: 'gpt4',
      type: AIModelErrorType.TIMEOUT,
      message: 'Request timeout',
      timestamp: Date.now(),
    });

    const stats = strategy.getErrorStats();
    expect(stats.total).toBe(1);
    expect(stats.byModel['gpt4']).toBe(1);
    expect(stats.byType['TIMEOUT']).toBe(1);
  });

  it('should track error statistics', () => {
    strategy.logError({
      model: 'gpt4',
      type: AIModelErrorType.RATE_LIMIT,
      message: 'Rate limit exceeded',
      timestamp: Date.now(),
    });

    strategy.logError({
      model: 'gpt4',
      type: AIModelErrorType.TIMEOUT,
      message: 'Timeout',
      timestamp: Date.now(),
    });

    strategy.logError({
      model: 'claude',
      type: AIModelErrorType.API_ERROR,
      message: 'API error',
      timestamp: Date.now(),
    });

    const stats = strategy.getErrorStats();
    expect(stats.total).toBe(3);
    expect(stats.byModel['gpt4']).toBe(2);
    expect(stats.byModel['claude']).toBe(1);
  });
});

describe('Retry Strategy', () => {
  let retry: RetryStrategy;

  beforeEach(() => {
    retry = new RetryStrategy();
  });

  it('should succeed on first try', async () => {
    const fn = async () => 'success';
    const result = await retry.executeWithRetry(fn);
    expect(result).toBe('success');
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('Failed');
      return 'success';
    };

    const result = await retry.executeWithRetry(fn, { maxRetries: 3, initialDelay: 10 });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should throw after max retries', async () => {
    const fn = async () => {
      throw new Error('Always fails');
    };

    await expect(
      retry.executeWithRetry(fn, { maxRetries: 2, initialDelay: 10 })
    ).rejects.toThrow('Failed after 2 retries');
  });

  it('should timeout long-running operations', async () => {
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'success';
    };

    await expect(
      retry.executeWithRetry(fn, { timeout: 100, maxRetries: 0 })
    ).rejects.toThrow('Operation timed out');
  });

  it('should not retry non-retryable errors', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      const error: any = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    };

    await expect(
      retry.executeWithRetry(fn, { maxRetries: 3, initialDelay: 10 })
    ).rejects.toThrow('Unauthorized');

    expect(attempts).toBe(1); // Should not retry
  });
});

describe('Circuit Breaker', () => {
  it('should allow requests in CLOSED state', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const fn = async () => 'success';

    const result = await breaker.execute(fn);
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const fn = async () => {
      throw new Error('Failed');
    };

    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('OPEN');

    // Next request should fail immediately
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const breaker = new CircuitBreaker(2, 100); // 100ms timeout
    const failFn = async () => {
      throw new Error('Failed');
    };

    // Open the circuit
    try {
      await breaker.execute(failFn);
    } catch (e) {}
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getState()).toBe('OPEN');

    // Wait for timeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be HALF_OPEN now, but will fail
    try {
      await breaker.execute(failFn);
    } catch (e) {
      // Expected
    }

    // Success should close the circuit
    const successFn = async () => 'success';
    await breaker.execute(successFn);
    expect(breaker.getState()).toBe('CLOSED');
  });
});
