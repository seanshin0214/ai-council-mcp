/**
 * Structured Logging System for AI Council MCP
 * Provides detailed logs for debugging and monitoring
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  metadata?: any;
}

export class Logger {
  private level: LogLevel;
  private context: string;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  constructor(context: string = 'AI-Council', level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = this.getLogLevelFromEnv() || level;
  }

  private getLogLevelFromEnv(): LogLevel | null {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return null;
    }
  }

  debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: this.context,
      metadata,
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Console output with colors
    this.printToConsole(entry);
  }

  private printToConsole(entry: LogEntry): void {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level as keyof typeof colors] || '';

    const timeParts = entry.timestamp.split('T');
    const timestamp = timeParts[1]?.split('.')[0] || '00:00:00';
    const prefix = `${color}[${timestamp}] [${entry.level}] [${entry.context}]${reset}`;

    console.log(`${prefix} ${entry.message}`);

    if (entry.metadata) {
      console.log(`${color}  Metadata:${reset}`, entry.metadata);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => LogLevel[log.level as keyof typeof LogLevel] >= level);
    }
    return this.logs;
  }

  clear(): void {
    this.logs = [];
  }
}

/**
 * Performance Logger
 * Tracks query performance metrics
 */
export class PerformanceLogger {
  private metrics: Array<{
    operation: string;
    model?: string;
    duration: number;
    success: boolean;
    timestamp: number;
    metadata?: any;
  }> = [];

  private readonly MAX_METRICS = 1000;

  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const start = Date.now();
    let success = true;
    let result: T;

    try {
      result = await fn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      this.record({
        operation,
        duration,
        success,
        timestamp: Date.now(),
        metadata,
      });
    }

    return result!;
  }

  private record(metric: {
    operation: string;
    model?: string;
    duration: number;
    success: boolean;
    timestamp: number;
    metadata?: any;
  }): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow operations
    if (metric.duration > 5000) {
      console.warn(
        `⚠️ Slow operation: ${metric.operation} took ${metric.duration}ms`
      );
    }
  }

  getStats(): {
    avgDuration: number;
    totalOperations: number;
    successRate: number;
    byOperation: Record<string, { count: number; avgDuration: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        avgDuration: 0,
        totalOperations: 0,
        successRate: 0,
        byOperation: {},
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = this.metrics.filter((m) => m.success).length;

    const byOperation: Record<string, { count: number; avgDuration: number }> = {};

    for (const metric of this.metrics) {
      if (!byOperation[metric.operation]) {
        byOperation[metric.operation] = { count: 0, avgDuration: 0 };
      }
      const opStats = byOperation[metric.operation];
      if (opStats) {
        opStats.count++;
        opStats.avgDuration += metric.duration;
      }
    }

    for (const op in byOperation) {
      const opStats = byOperation[op];
      if (opStats) {
        opStats.avgDuration /= opStats.count;
      }
    }

    return {
      avgDuration: totalDuration / this.metrics.length,
      totalOperations: this.metrics.length,
      successRate: (successCount / this.metrics.length) * 100,
      byOperation,
    };
  }

  getMetrics(): typeof this.metrics {
    return this.metrics;
  }

  clear(): void {
    this.metrics = [];
  }
}

/**
 * Query Logger
 * Tracks all user queries and AI responses
 */
export class QueryLogger {
  private queries: Array<{
    id: string;
    query: string;
    model: string;
    response: string;
    timestamp: number;
    duration: number;
    tokensUsed?: {
      input: number;
      output: number;
    };
    fromCache: boolean;
  }> = [];

  private readonly MAX_QUERIES = 500;

  log(entry: {
    query: string;
    model: string;
    response: string;
    duration: number;
    tokensUsed?: { input: number; output: number };
    fromCache: boolean;
  }): void {
    this.queries.push({
      id: this.generateId(),
      timestamp: Date.now(),
      ...entry,
    });

    if (this.queries.length > this.MAX_QUERIES) {
      this.queries.shift();
    }

    console.log(
      `📝 Query logged: ${entry.model} ${entry.fromCache ? '(cached)' : ''} - ${entry.duration}ms`
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueries(limit?: number): typeof this.queries {
    if (limit) {
      return this.queries.slice(-limit);
    }
    return this.queries;
  }

  getQueryById(id: string): (typeof this.queries)[0] | undefined {
    return this.queries.find((q) => q.id === id);
  }

  getStats(): {
    total: number;
    cacheHitRate: number;
    avgDuration: number;
    byModel: Record<string, number>;
    totalTokens: { input: number; output: number };
  } {
    if (this.queries.length === 0) {
      return {
        total: 0,
        cacheHitRate: 0,
        avgDuration: 0,
        byModel: {},
        totalTokens: { input: 0, output: 0 },
      };
    }

    const cachedCount = this.queries.filter((q) => q.fromCache).length;
    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const byModel: Record<string, number> = {};
    const totalTokens = { input: 0, output: 0 };

    for (const query of this.queries) {
      byModel[query.model] = (byModel[query.model] || 0) + 1;
      if (query.tokensUsed) {
        totalTokens.input += query.tokensUsed.input;
        totalTokens.output += query.tokensUsed.output;
      }
    }

    return {
      total: this.queries.length,
      cacheHitRate: (cachedCount / this.queries.length) * 100,
      avgDuration: totalDuration / this.queries.length,
      byModel,
      totalTokens,
    };
  }

  clear(): void {
    this.queries = [];
  }
}

// Global singletons
export const logger = new Logger('AI-Council');
export const perfLogger = new PerformanceLogger();
export const queryLogger = new QueryLogger();
