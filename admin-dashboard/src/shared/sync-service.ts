// GSFP Real-Time Synchronization Service
// Provides real-time data synchronization between admin dashboard and frontend

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { configManager, isAdminContext } from './config-manager';

export interface SyncEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  collection: string;
  documentId: string;
  data: any;
  timestamp: Timestamp;
  source: 'admin' | 'frontend';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface SyncListener {
  id: string;
  collection: string;
  callback: (event: SyncEvent) => void;
  filter?: (event: SyncEvent) => boolean;
}

// Initialize Firebase for shared services
let db: any;
let isInitialized = false;

function initializeSyncService() {
  if (isInitialized) return;
  
  try {
    const firebaseConfig = configManager.getFirebaseConfig();
    if (firebaseConfig.apiKey) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      throw new Error('Firebase configuration not found. Please check your environment variables.');
    }
    isInitialized = true;
  } catch (error) {
    console.warn('Sync service Firebase not initialized yet:', error);
    // Will be initialized later when config is ready
  }
}

// Try to initialize immediately if possible
try {
  initializeSyncService();
} catch (error) {
  console.log('Sync service initialization deferred until config is loaded');
}

class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private listeners: Map<string, SyncListener> = new Map();
  private unsubscribeFunctions: Map<string, () => void> = new Map();
  private syncQueue: SyncEvent[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  /**
   * Initialize real-time synchronization for specified collections
   */
  async initialize(collections: string[] = ['articles', 'events', 'media', 'partners']) {
    // Ensure Firebase is initialized
    if (!isInitialized) {
      initializeSyncService();
    }
    
    if (!configManager.isFeatureEnabled('realTimeSync')) {
      console.log('Real-time sync is disabled');
      return;
    }

    console.log('Initializing real-time sync for collections:', collections);

    for (const collectionName of collections) {
      await this.setupCollectionListener(collectionName);
    }

    // Start processing sync queue
    this.startSyncQueueProcessor();
  }

  /**
   * Set up real-time listener for a specific collection
   */
  private async setupCollectionListener(collectionName: string) {
    if (!isInitialized || !db) {
      console.warn('Sync service not initialized, skipping listener for:', collectionName);
      return;
    }
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const event: SyncEvent = {
          id: `${collectionName}_${change.doc.id}_${Date.now()}`,
          type: this.getChangeType(change.type),
          collection: collectionName,
          documentId: change.doc.id,
          data: change.doc.data(),
          timestamp: Timestamp.now(),
          source: isAdminContext() ? 'admin' : 'frontend',
          userId: change.doc.data()?.updatedBy || change.doc.data()?.createdBy
        };

        this.handleSyncEvent(event);
      });
    });

    this.unsubscribeFunctions.set(collectionName, unsubscribe);
  }

  /**
   * Add a listener for sync events
   */
  addListener(listener: SyncListener): () => void {
    this.listeners.set(listener.id, listener);
    return () => this.removeListener(listener.id);
  }

  /**
   * Remove a sync listener
   */
  removeListener(listenerId: string) {
    this.listeners.delete(listenerId);
  }

  /**
   * Broadcast sync event to all matching listeners
   */
  private handleSyncEvent(event: SyncEvent) {
    // Add to sync queue for processing
    this.syncQueue.push(event);

    // Notify matching listeners
    this.listeners.forEach((listener) => {
      if (listener.collection === event.collection || listener.collection === '*') {
        if (!listener.filter || listener.filter(event)) {
          try {
            listener.callback(event);
          } catch (error) {
            console.error('Error in sync listener:', error);
          }
        }
      }
    });
  }

  /**
   * Process sync queue to ensure data consistency
   */
  private async startSyncQueueProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.syncQueue.length === 0) return;

      this.isProcessing = true;

      try {
        const events = [...this.syncQueue];
        this.syncQueue = [];

        // Process events in batches
        const batch = writeBatch(db);
        const processedEvents: string[] = [];

        for (const event of events) {
          try {
            await this.processSyncEvent(event, batch);
            processedEvents.push(event.id);
          } catch (error) {
            console.error('Error processing sync event:', event.id, error);
          }
        }

        // Commit batch if there are changes
        if (processedEvents.length > 0) {
          await batch.commit();
          console.log(`Processed ${processedEvents.length} sync events`);
        }
      } catch (error) {
        console.error('Error in sync queue processor:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 1000); // Process every second
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(event: SyncEvent, batch: any) {
    if (!isInitialized || !db) {
      console.warn('Sync service not initialized, skipping event processing');
      return;
    }
    
    // Update sync metadata
    const syncDocRef = doc(collection(db, '_sync'), event.id);
    batch.set(syncDocRef, {
      ...event,
      processed: true,
      processedAt: Timestamp.now()
    });

    // Handle cross-application notifications
    if (event.type === 'publish' && event.collection === 'articles') {
      await this.notifyContentPublication(event);
    }

    // Update cache invalidation
    await this.invalidateCaches(event);
  }

  /**
   * Notify about content publication
   */
  private async notifyContentPublication(event: SyncEvent) {
    if (!configManager.isFeatureEnabled('pushNotifications')) return;
    if (!isInitialized || !db) {
      console.warn('Sync service not initialized, skipping notification');
      return;
    }

    // Create notification document
    const notificationRef = collection(db, 'notifications');
    await addDoc(notificationRef, {
      type: 'content_published',
      title: 'New Content Published',
      message: `New ${event.collection} "${event.data.title || event.documentId}" is now live`,
      targetUsers: ['all'], // Notify all users
      source: event.source,
      createdAt: Timestamp.now(),
      read: false
    });
  }

  /**
   * Invalidate relevant caches
   */
  private async invalidateCaches(event: SyncEvent) {
    // Invalidate frontend caches for updated content
    if (typeof window !== 'undefined' && window.localStorage) {
      const cacheKey = `gsfp_cache_${event.collection}`;
      localStorage.removeItem(cacheKey);

      // Dispatch custom event for cache invalidation
      window.dispatchEvent(new CustomEvent('gsfp-cache-invalidate', {
        detail: { collection: event.collection, documentId: event.documentId }
      }));
    }
  }

  /**
   * Get change type from Firestore change type
   */
  private getChangeType(changeType: string): SyncEvent['type'] {
    switch (changeType) {
      case 'added': return 'create';
      case 'modified': return 'update';
      case 'removed': return 'delete';
      default: return 'update';
    }
  }

  /**
   * Manually trigger sync for testing
   */
  async triggerManualSync(collectionName: string, documentId?: string) {
    if (!isInitialized || !db) {
      console.warn('Sync service not initialized, skipping manual sync');
      return;
    }
    
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, orderBy('updatedAt', 'desc'));

    if (documentId) {
      q = query(collectionRef, where('__name__', '==', doc(collectionRef, documentId)));
    }

    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const event: SyncEvent = {
        id: `manual_${collectionName}_${doc.id}_${Date.now()}`,
        type: 'update',
        collection: collectionName,
        documentId: doc.id,
        data: doc.data(),
        timestamp: Timestamp.now(),
        source: 'admin'
      };
      this.handleSyncEvent(event);
    });
  }

  /**
   * Get sync status and health
   */
  getSyncStatus() {
    return {
      listeners: this.listeners.size,
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      lastProcessed: this.syncQueue.length > 0 ? this.syncQueue[0].timestamp : null
    };
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions.clear();
    this.listeners.clear();
    this.syncQueue = [];
  }
}

// Export singleton instance
export const syncService = RealTimeSyncService.getInstance();

// Export convenience functions
export const initializeSync = (collections?: string[]) => syncService.initialize(collections);
export const addSyncListener = (listener: SyncListener) => syncService.addListener(listener);
export const getSyncStatus = () => syncService.getSyncStatus();
export const triggerManualSync = (collection: string, documentId?: string) =>
  syncService.triggerManualSync(collection, documentId);
