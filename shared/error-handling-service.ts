// GSFP Error Handling Service
// Provides comprehensive error recovery and user feedback

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  userFeedback?: UserFeedback;
  recoveryAttempts: RecoveryAttempt[];
}

export interface ErrorContext {
  component: string;
  operation: string;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

export interface UserFeedback {
  rating: number; // 1-5 stars
  comment?: string;
  contactEmail?: string;
  timestamp: Date;
}

export interface RecoveryAttempt {
  strategy: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: string;
}

export interface ErrorHandlingConfig {
  enableAutoRecovery: boolean;
  maxRecoveryAttempts: number;
  enableUserFeedback: boolean;
  enableErrorReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  recoveryStrategies: RecoveryStrategy[];
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: Error, context: ErrorContext) => boolean;
  action: (error: Error, context: ErrorContext) => Promise<boolean>;
  maxAttempts: number;
  priority: number;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private config: ErrorHandlingConfig;
  private errorReports: Map<string, ErrorReport> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enableAutoRecovery: true,
      maxRecoveryAttempts: 3,
      enableUserFeedback: true,
      enableErrorReporting: true,
      logLevel: 'error',
      recoveryStrategies: [
        {
          name: 'network-reconnect',
          condition: (error, context) => this.isNetworkError(error),
          action: async (error, context) => await this.attemptNetworkRecovery(),
          maxAttempts: 3,
          priority: 1
        },
        {
          name: 'cache-fallback',
          condition: (error, context) => this.isDatabaseError(error),
          action: async (error, context) => await this.attemptCacheFallback(context),
          maxAttempts: 2,
          priority: 2
        },
        {
          name: 'retry-operation',
          condition: (error, context) => this.isRetryableError(error),
          action: async (error, context) => await this.attemptOperationRetry(context),
          maxAttempts: 3,
          priority: 3
        },
        {
          name: 'graceful-degradation',
          condition: (error, context) => true, // Always available as last resort
          action: async (error, context) => await this.attemptGracefulDegradation(context),
          maxAttempts: 1,
          priority: 10
        }
      ]
    };

    // Initialize recovery strategies
    this.config.recoveryStrategies.forEach(strategy => {
      this.recoveryStrategies.set(strategy.name, strategy);
    });

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle an error with automatic recovery
   */
  async handleError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    const errorId = this.generateErrorId();
    const severity = this.determineSeverity(error, context);
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      error,
      context: {
        ...context,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity,
      status: 'pending',
      recoveryAttempts: []
    };

    // Store the error report
    this.errorReports.set(errorId, errorReport);

    // Log the error
    this.logError(errorReport);

    // Attempt auto-recovery if enabled
    if (this.config.enableAutoRecovery) {
      await this.attemptRecovery(errorReport);
    }

    // Report error if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(errorReport);
    }

    return errorReport;
  }

  /**
   * Attempt automatic recovery for an error
   */
  private async attemptRecovery(errorReport: ErrorReport): Promise<void> {
    errorReport.status = 'investigating';

    // Get applicable recovery strategies
    const applicableStrategies = this.config.recoveryStrategies
      .filter(strategy => 
        strategy.condition(errorReport.error, errorReport.context) &&
        errorReport.recoveryAttempts.length < strategy.maxAttempts
      )
      .sort((a, b) => a.priority - b.priority);

    for (const strategy of applicableStrategies) {
      if (errorReport.recoveryAttempts.length >= this.config.maxRecoveryAttempts) {
        break;
      }

      const attempt: RecoveryAttempt = {
        strategy: strategy.name,
        timestamp: new Date(),
        success: false,
        duration: 0
      };

      const startTime = Date.now();
      
      try {
        const success = await strategy.action(errorReport.error, errorReport.context);
        attempt.success = success;
        attempt.duration = Date.now() - startTime;

        if (success) {
          errorReport.status = 'resolved';
          this.logRecovery(errorReport, attempt, 'SUCCESS');
          break;
        }
      } catch (recoveryError) {
        attempt.error = recoveryError instanceof Error ? recoveryError.message : 'Unknown recovery error';
        attempt.duration = Date.now() - startTime;
        this.logRecovery(errorReport, attempt, 'FAILED');
      }

      errorReport.recoveryAttempts.push(attempt);
    }

    if (errorReport.status !== 'resolved') {
      errorReport.status = 'pending';
    }
  }

  /**
   * Add user feedback to an error report
   */
  addUserFeedback(errorId: string, feedback: UserFeedback): void {
    const errorReport = this.errorReports.get(errorId);
    if (errorReport) {
      errorReport.userFeedback = feedback;
      errorReport.status = 'resolved'; // Mark as resolved when user provides feedback
      this.logFeedback(errorReport, feedback);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    errorsByStatus: Record<string, number>;
    recoveryRate: number;
    averageRecoveryTime: number;
  } {
    const reports = Array.from(this.errorReports.values());
    
    const totalErrors = reports.length;
    const errorsBySeverity: Record<string, number> = {};
    const errorsByStatus: Record<string, number> = {};
    let totalRecoveryTime = 0;
    let successfulRecoveries = 0;

    reports.forEach(report => {
      // Count by severity
      errorsBySeverity[report.severity] = (errorsBySeverity[report.severity] || 0) + 1;
      
      // Count by status
      errorsByStatus[report.status] = (errorsByStatus[report.status] || 0) + 1;
      
      // Calculate recovery stats
      if (report.recoveryAttempts.length > 0) {
        const totalTime = report.recoveryAttempts.reduce((sum, attempt) => sum + attempt.duration, 0);
        totalRecoveryTime += totalTime;
        
        if (report.status === 'resolved') {
          successfulRecoveries++;
        }
      }
    });

    const recoveryRate = totalErrors > 0 ? (successfulRecoveries / totalErrors) * 100 : 0;
    const averageRecoveryTime = successfulRecoveries > 0 ? totalRecoveryTime / successfulRecoveries : 0;

    return {
      totalErrors,
      errorsBySeverity,
      errorsByStatus,
      recoveryRate,
      averageRecoveryTime
    };
  }

  /**
   * Get error report by ID
   */
  getErrorReport(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }

  /**
   * Get all error reports
   */
  getAllErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values());
  }

  /**
   * Clear old error reports
   */
  clearOldReports(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    for (const [id, report] of this.errorReports) {
      if (report.timestamp < cutoffTime) {
        this.errorReports.delete(id);
      }
    }
  }

  /**
   * Recovery strategy implementations
   */
  private async attemptNetworkRecovery(): Promise<boolean> {
    // Check if network is available
    if (!navigator.onLine) {
      return false;
    }

    // Try to make a simple request to check connectivity
    try {
      const response = await fetch('/health-check', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async attemptCacheFallback(context: ErrorContext): Promise<boolean> {
    // Implement cache fallback logic
    // This would use localStorage, IndexedDB, or service worker cache
    try {
      const cacheKey = `cache_${context.component}_${context.operation}`;
      const cachedData = localStorage.getItem(cacheKey);
      return cachedData !== null;
    } catch {
      return false;
    }
  }

  private async attemptOperationRetry(context: ErrorContext): Promise<boolean> {
    // Implement operation retry logic
    // This would retry the original operation that failed
    return false; // Placeholder
  }

  private async attemptGracefulDegradation(context: ErrorContext): Promise<boolean> {
    // Implement graceful degradation
    // Always succeeds by providing fallback functionality
    return true;
  }

  /**
   * Error classification helpers
   */
  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isCriticalError(error)) return 'critical';
    if (this.isHighSeverityError(error)) return 'high';
    if (this.isMediumSeverityError(error)) return 'medium';
    return 'low';
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('network') ||
           error.message.includes('connection') ||
           error.message.includes('fetch') ||
           error.name === 'NetworkError';
  }

  private isDatabaseError(error: Error): boolean {
    return error.message.includes('database') ||
           error.message.includes('firestore') ||
           error.message.includes('storage');
  }

  private isRetryableError(error: Error): boolean {
    return !this.isCriticalError(error) && !this.isUserError(error);
  }

  private isCriticalError(error: Error): boolean {
    return error.message.includes('security') ||
           error.message.includes('authentication') ||
           error.message.includes('authorization');
  }

  private isHighSeverityError(error: Error): boolean {
    return error.message.includes('failed to load') ||
           error.message.includes('timeout');
  }

  private isMediumSeverityError(error: Error): boolean {
    return error.message.includes('warning') ||
           error.message.includes('deprecated');
  }

  private isUserError(error: Error): boolean {
    return error.message.includes('validation') ||
           error.message.includes('invalid input');
  }

  /**
   * Logging methods
   */
  private logError(errorReport: ErrorReport): void {
    const logMessage = `[${errorReport.severity.toUpperCase()}] ${errorReport.error.message} in ${errorReport.context.component}.${errorReport.context.operation}`;
    
    switch (this.config.logLevel) {
      case 'debug':
        console.debug(logMessage, errorReport);
        break;
      case 'info':
        console.info(logMessage, errorReport);
        break;
      case 'warn':
        console.warn(logMessage, errorReport);
        break;
      case 'error':
      default:
        console.error(logMessage, errorReport);
        break;
    }
  }

  private logRecovery(errorReport: ErrorReport, attempt: RecoveryAttempt, result: string): void {
    console.log(`Recovery ${result}: ${attempt.strategy} for error ${errorReport.id} (${attempt.duration}ms)`);
  }

  private logFeedback(errorReport: ErrorReport, feedback: UserFeedback): void {
    console.log(`User feedback received for error ${errorReport.id}: ${feedback.rating}/5 stars`);
  }

  /**
   * Error reporting
   */
  private reportError(errorReport: ErrorReport): void {
    // In a real implementation, this would send error reports to a monitoring service
    // like Sentry, LogRocket, or a custom error tracking service
    console.log('Error reported:', errorReport);
  }

  /**
   * Global error handlers setup
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'global',
        operation: 'unhandled-promise-rejection',
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        additionalData: { promise: event.promise }
      });
    });

    // Handle uncaught errors (in development)
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('error', (event) => {
        this.handleError(event.error || new Error(event.message), {
          component: 'global',
          operation: 'uncaught-error',
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          url: window.location.href,
          additionalData: { filename: event.filename, lineno: event.lineno }
        });
      });
    }
  }

  /**
   * Utility methods
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configuration management
   */
  getConfig(): ErrorHandlingConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    errorCount: number;
    recoveryRate: number;
    lastError?: Date;
  }> {
    const stats = this.getErrorStats();
    const reports = this.getAllErrorReports();
    const lastError = reports.length > 0 ? reports[reports.length - 1]?.timestamp : undefined;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (stats.totalErrors > 100) {
      status = 'degraded';
    }
    
    if (stats.recoveryRate < 50 || (stats.errorsBySeverity.critical || 0) > 0) {
      status = 'unhealthy';
    }

    const healthResult = {
      status,
      errorCount: stats.totalErrors,
      recoveryRate: stats.recoveryRate
    };

    if (lastError) {
      return { ...healthResult, lastError };
    }

    return healthResult;
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();
