// GSFP Integration Monitoring & Logging
// Provides monitoring and logging for admin-frontend integration

import { configManager } from './config-manager';
import { syncService } from './sync-service';
import { contentService } from './content-service';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    firebase: boolean;
    sync: boolean;
    content: boolean;
    config: boolean;
  };
  metrics: {
    uptime: number;
    syncEventsProcessed: number;
    contentOperations: number;
    errors: number;
  };
  lastChecked: Date;
}

class IntegrationMonitor {
  private logs: LogEntry[] = [];
  private healthStatus: HealthStatus;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.healthStatus = {
      overall: 'healthy',
      services: {
        firebase: false,
        sync: false,
        content: false,
        config: false
      },
      metrics: {
        uptime: 0,
        syncEventsProcessed: 0,
        contentOperations: 0,
        errors: 0
      },
      lastChecked: new Date()
    };

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Log an event
   */
  log(level: LogEntry['level'], component: string, message: string, data?: any, userId?: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      sessionId: this.sessionId
    };
    
    if (data !== undefined) {
      entry.data = data;
    }
    
    if (userId !== undefined) {
      entry.userId = userId;
    }

    this.logs.push(entry);

    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Console output for development
    if (configManager.getConfig().isDevelopment || level === 'error') {
      const prefix = `[${entry.timestamp.toISOString()}] ${level.toUpperCase()} [${component}]`;
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${message}`, data || '');
    }

    // Update health metrics for errors
    if (level === 'error') {
      this.healthStatus.metrics.errors++;
      this.updateHealthStatus();
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    setInterval(() => {
      this.checkHealthStatus();
    }, 30000);

    // Initial health check
    setTimeout(() => {
      this.checkHealthStatus();
    }, 5000);
  }

  /**
   * Check overall health status
   */
  private async checkHealthStatus(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check configuration
      const configValid = configManager.validateConfig().isValid;
      this.healthStatus.services.config = configValid;

      // Check Firebase connection
      this.healthStatus.services.firebase = await this.checkFirebaseHealth();

      // Check sync service
      this.healthStatus.services.sync = syncService.getSyncStatus().listeners > 0;

      // Check content service
      this.healthStatus.services.content = await this.checkContentServiceHealth();

      // Update metrics
      this.healthStatus.metrics.uptime = Date.now() - startTime;
      this.healthStatus.lastChecked = new Date();

      // Determine overall health
      this.updateHealthStatus();

      this.log('info', 'HealthMonitor', 'Health check completed', {
        status: this.healthStatus.overall,
        services: this.healthStatus.services
      });

    } catch (error) {
      this.log('error', 'HealthMonitor', 'Health check failed', error);
      this.healthStatus.overall = 'unhealthy';
    }
  }

  /**
   * Check Firebase health
   */
  private async checkFirebaseHealth(): Promise<boolean> {
    try {
      // Simple health check - try to read from a test collection
      const stats = await contentService.getContentStats();
      return typeof stats.total === 'number';
    } catch (error) {
      this.log('error', 'FirebaseHealth', 'Firebase health check failed', error);
      return false;
    }
  }

  /**
   * Check content service health
   */
  private async checkContentServiceHealth(): Promise<boolean> {
    try {
      // Try to get content stats
      const stats = await contentService.getContentStats();
      return stats && typeof stats.total === 'number';
    } catch (error) {
      this.log('error', 'ContentHealth', 'Content service health check failed', error);
      return false;
    }
  }

  /**
   * Update overall health status
   */
  private updateHealthStatus(): void {
    const services = this.healthStatus.services;
    const allHealthy = Object.values(services).every(service => service);

    if (allHealthy && this.healthStatus.metrics.errors === 0) {
      this.healthStatus.overall = 'healthy';
    } else if (Object.values(services).some(service => service)) {
      this.healthStatus.overall = 'degraded';
    } else {
      this.healthStatus.overall = 'unhealthy';
    }
  }

  /**
   * Track sync event processing
   */
  trackSyncEvent(): void {
    this.healthStatus.metrics.syncEventsProcessed++;
  }

  /**
   * Track content operation
   */
  trackContentOperation(): void {
    this.healthStatus.metrics.contentOperations++;
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Get recent logs
   */
  getLogs(level?: LogEntry['level'], component?: string, limit = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    return filteredLogs.slice(-limit);
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear old logs
   */
  clearLogs(olderThanHours = 24): void {
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `gsfp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Report performance metrics
   */
  reportPerformance(operation: string, duration: number, success: boolean): void {
    this.log('info', 'Performance', `Operation completed: ${operation}`, {
      duration,
      success,
      timestamp: new Date()
    });
  }

  /**
   * Alert for critical issues
   */
  alertCritical(component: string, message: string, data?: any): void {
    this.log('error', component, `CRITICAL: ${message}`, data);

    // In production, this could send alerts to monitoring services
    if (configManager.getConfig().isProduction) {
      console.error(`🚨 CRITICAL ALERT: ${component} - ${message}`, data);
      // TODO: Send to monitoring service (e.g., Sentry, DataDog, etc.)
    }
  }
}

// Export singleton instance
export const integrationMonitor = new IntegrationMonitor();

// Export convenience functions
export const log = (level: LogEntry['level'], component: string, message: string, data?: any, userId?: string) =>
  integrationMonitor.log(level, component, message, data, userId);
export const getHealthStatus = () => integrationMonitor.getHealthStatus();
export const getLogs = (level?: LogEntry['level'], component?: string, limit?: number) =>
  integrationMonitor.getLogs(level, component, limit);
export const trackSyncEvent = () => integrationMonitor.trackSyncEvent();
export const trackContentOperation = () => integrationMonitor.trackContentOperation();
export const reportPerformance = (operation: string, duration: number, success: boolean) =>
  integrationMonitor.reportPerformance(operation, duration, success);
export const alertCritical = (component: string, message: string, data?: any) =>
  integrationMonitor.alertCritical(component, message, data);
