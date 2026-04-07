// GSFP Retry Service
// Provides intelligent retry mechanisms for failed operations

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // in milliseconds
  maxDelay?: number; // in milliseconds
  backoffFactor?: number;
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  attempts: number;
  totalDuration: number;
}

export interface RetryConfig {
  network: RetryOptions;
  database: RetryOptions;
  storage: RetryOptions;
  default: RetryOptions;
}

class RetryService {
  private static instance: RetryService;
  private config: RetryConfig;

  private constructor() {
    this.config = {
      network: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        jitter: true,
        retryCondition: (error: any) => {
          // Retry on network errors, 5xx status codes, and rate limits
          return this.isNetworkError(error) || 
                 this.isServerError(error) || 
                 this.isRateLimitError(error);
        }
      },
      database: {
        maxAttempts: 5,
        baseDelay: 500,
        maxDelay: 5000,
        backoffFactor: 1.5,
        jitter: true,
        retryCondition: (error: any) => {
          // Retry on connection errors and timeouts
          return this.isConnectionError(error) || 
                 this.isTimeoutError(error);
        }
      },
      storage: {
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 15000,
        backoffFactor: 2,
        jitter: true,
        retryCondition: (error: any) => {
          // Retry on upload failures and quota exceeded
          return this.isUploadError(error) || 
                 this.isQuotaError(error);
        }
      },
      default: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        backoffFactor: 2,
        jitter: true,
        retryCondition: (error: any) => true // Retry all errors by default
      }
    };
  }

  static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.config.default, ...options };
    const startTime = Date.now();
    let lastError: any;
    let attempts = 0;

    while (attempts < config.maxAttempts!) {
      attempts++;
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        return {
          success: true,
          result,
          attempts,
          totalDuration: duration
        };
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(error)) {
          break;
        }
        
        // If this is the last attempt, don't wait
        if (attempts >= config.maxAttempts!) {
          break;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempts, config);
        await this.delay(delay);
      }
    }

    const duration = Date.now() - startTime;
    
    return {
      success: false,
      error: lastError,
      attempts,
      totalDuration: duration
    };
  }

  /**
   * Execute with network-specific retry logic
   */
  async executeNetworkRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(operation, this.config.network);
  }

  /**
   * Execute with database-specific retry logic
   */
  async executeDatabaseRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(operation, this.config.database);
  }

  /**
   * Execute with storage-specific retry logic
   */
  async executeStorageRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(operation, this.config.storage);
  }

  /**
   * Batch retry for multiple operations
   */
  async executeBatchRetry<T>(
    operations: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>[]> {
    const results: RetryResult<T>[] = [];
    
    // Execute operations in parallel with individual retry logic
    const promises = operations.map(async (operation, index) => {
      try {
        const result = await this.executeWithRetry(operation, options);
        return { index, result };
      } catch (error) {
        return { 
          index, 
          result: {
            success: false,
            error,
            attempts: 0,
            totalDuration: 0
          } as RetryResult<T>
        };
      }
    });

    const batchResults = await Promise.all(promises);
    
    // Sort results by original index
    batchResults.sort((a, b) => a.index - b.index);
    results.push(...batchResults.map(r => r.result));

    return results;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, options: RetryOptions): number {
    let delay = options.baseDelay! * Math.pow(options.backoffFactor!, attempt - 1);
    delay = Math.min(delay, options.maxDelay!);
    
    // Add jitter to prevent thundering herd
    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Simple delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Error detection helpers
   */
  private isNetworkError(error: any): boolean {
    if (!error) return false;
    
    // Check for common network error indicators
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('network') ||
      error.message?.includes('connection') ||
      navigator.onLine === false
    );
  }

  private isServerError(error: any): boolean {
    if (!error || !error.status) return false;
    
    // Retry on 5xx server errors
    return error.status >= 500 && error.status < 600;
  }

  private isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    return (
      error.status === 429 ||
      error.code === 'RATE_LIMIT_EXCEEDED' ||
      error.message?.includes('rate limit') ||
      error.message?.includes('too many requests')
    );
  }

  private isConnectionError(error: any): boolean {
    if (!error) return false;
    
    return (
      error.code === 'connection-error' ||
      error.code === 'unavailable' ||
      error.message?.includes('connection') ||
      error.message?.includes('unavailable')
    );
  }

  private isTimeoutError(error: any): boolean {
    if (!error) return false;
    
    return (
      error.code === 'timeout' ||
      error.code === 'DEADLINE_EXCEEDED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('deadline')
    );
  }

  private isUploadError(error: any): boolean {
    if (!error) return false;
    
    return (
      error.code === 'upload-error' ||
      error.code === 'CANCELED' ||
      error.message?.includes('upload') ||
      error.message?.includes('canceled')
    );
  }

  private isQuotaError(error: any): boolean {
    if (!error) return false;
    
    return (
      error.code === 'quota-exceeded' ||
      error.code === 'storage/quota-exceeded' ||
      error.message?.includes('quota') ||
      error.message?.includes('storage')
    );
  }

  /**
   * Get retry configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Update retry configuration
   */
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = {
      network: { ...this.config.network, ...newConfig.network },
      database: { ...this.config.database, ...newConfig.database },
      storage: { ...this.config.storage, ...newConfig.storage },
      default: { ...this.config.default, ...newConfig.default }
    };
  }

  /**
   * Get retry statistics
   */
  getRetryStats(results: RetryResult<any>[]): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageAttempts: number;
    averageDuration: number;
    totalDuration: number;
  } {
    const totalOperations = results.length;
    const successfulOperations = results.filter(r => r.success).length;
    const failedOperations = totalOperations - successfulOperations;
    
    const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);
    const averageAttempts = totalAttempts / totalOperations;
    
    const totalDuration = results.reduce((sum, r) => sum + r.totalDuration, 0);
    const averageDuration = totalDuration / totalOperations;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageAttempts,
      averageDuration,
      totalDuration
    };
  }

  /**
   * Health check for retry service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      network: boolean;
      database: boolean;
      storage: boolean;
    };
    timestamp: Date;
  }> {
    const checks = {
      network: navigator.onLine,
      database: true, // Would need actual DB ping
      storage: true  // Would need actual storage ping
    };

    const allHealthy = Object.values(checks).every(check => check);
    const someHealthy = Object.values(checks).some(check => check);

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      checks,
      timestamp: new Date()
    };
  }
}

export const retryService = RetryService.getInstance();
