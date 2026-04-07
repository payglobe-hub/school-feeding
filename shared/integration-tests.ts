// GSFP Integration Tests
// Tests data synchronization between admin dashboard and frontend
// Note: These tests should be run from the admin-dashboard or frontend folders
// where Firebase dependencies are properly configured

import { configManager } from './config-manager';
import { syncService } from './sync-service';
import { contentService } from './content-service';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class IntegrationTester {
  private results: TestResult[] = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('Starting GSFP Integration Tests...');

    this.results = [];

    // Configuration tests
    await this.testConfigurationSync();
    await this.testServiceInitialization();

    // Service-level tests (without direct Firebase calls)
    await this.testContentServiceMethods();
    await this.testSyncServiceMethods();

    console.log('Integration Tests Completed');
    this.printResults();

    return this.results;
  }

  /**
   * Test that configuration is properly synchronized
   */
  private async testConfigurationSync(): Promise<void> {
    const startTime = Date.now();

    try {
      const config = configManager.getConfig();

      // Test that required configuration is present
      if (!config.firebase.apiKey || !config.firebase.projectId) {
        throw new Error('Firebase configuration incomplete');
      }

      // Test that environment-specific settings are correct
      if (config.isProduction && !config.features.realTimeSync) {
        throw new Error('Real-time sync should be enabled in production');
      }

      this.addResult('Configuration Sync', true, Date.now() - startTime);
    } catch (error) {
      this.addResult('Configuration Sync', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test service initialization
   */
  private async testServiceInitialization(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test that services can be initialized (they should be initialized in app startup)
      const config = configManager.getConfig();
      if (!config) {
        throw new Error('Configuration not initialized');
      }

      // Test sync service status
      const syncStatus = syncService.getSyncStatus();
      if (typeof syncStatus.listeners !== 'number') {
        throw new Error('Sync service not properly initialized');
      }

      this.addResult('Service Initialization', true, Date.now() - startTime);
    } catch (error) {
      this.addResult('Service Initialization', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test content service methods (mock testing)
   */
  private async testContentServiceMethods(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test that content service methods exist and are callable
      if (typeof contentService.createContent !== 'function') {
        throw new Error('Content service createContent method not available');
      }

      if (typeof contentService.getContent !== 'function') {
        throw new Error('Content service getContent method not available');
      }

      if (typeof contentService.getContentList !== 'function') {
        throw new Error('Content service getContentList method not available');
      }

      // Test method signatures by calling with invalid data (should fail gracefully)
      try {
        await contentService.getContent('invalid-id');
      } catch (error) {
        // Expected to fail with invalid ID
      }

      this.addResult('Content Service Methods', true, Date.now() - startTime);
    } catch (error) {
      this.addResult('Content Service Methods', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test sync service methods
   */
  private async testSyncServiceMethods(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test that sync service methods exist
      if (typeof syncService.initialize !== 'function') {
        throw new Error('Sync service initialize method not available');
      }

      if (typeof syncService.addListener !== 'function') {
        throw new Error('Sync service addListener method not available');
      }

      if (typeof syncService.getSyncStatus !== 'function') {
        throw new Error('Sync service getSyncStatus method not available');
      }

      // Test listener management
      const testListener = {
        id: 'test-listener',
        collection: 'test',
        callback: () => {}
      };

      const unsubscribe = syncService.addListener(testListener);
      if (typeof unsubscribe !== 'function') {
        throw new Error('Listener subscription did not return unsubscribe function');
      }

      // Clean up
      unsubscribe();

      this.addResult('Sync Service Methods', true, Date.now() - startTime);
    } catch (error) {
      this.addResult('Sync Service Methods', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Add test result
   */
  private addResult(testName: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = {
      testName,
      passed,
      duration
    };
    
    if (error !== undefined) {
      result.error = error;
    }
    
    this.results.push(result);

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName} (${duration}ms)`);
    if (error) {
      console.error(`   Error: ${error}`);
    }
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const failed = total - passed;

    console.log('\n=== Integration Test Results ===');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`- ${result.testName}: ${result.error}`);
      });
    }

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\nTotal Duration: ${totalDuration}ms`);
    console.log(`Average Duration: ${(totalDuration / total).toFixed(0)}ms per test`);
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed(): boolean {
    return this.results.every(result => result.passed);
  }
}

// Export singleton instance
export const integrationTester = new IntegrationTester();

// Export convenience functions
export const runIntegrationTests = () => integrationTester.runAllTests();
export const getTestResults = () => integrationTester.getResults();
export const allTestsPassed = () => integrationTester.allTestsPassed();
