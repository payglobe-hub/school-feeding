// GSFP Shared Content Management API
// Provides unified CRUD operations for content across admin and frontend

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot,
  Firestore,
  QueryDocumentSnapshot,
  DocumentChange,
  CollectionReference,
  Query,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { configManager } from './config-manager';
import { syncService } from './sync-service';
import { contentValidator } from './content-validator';
import { retryService } from './retry-service';

export interface ContentItem {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  type: 'article' | 'event' | 'media' | 'partner';
  tags?: string[];
  featured?: boolean;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  metadata?: Record<string, any>;
  validationScore?: number;
}

export interface ContentFilters {
  status?: ContentItem['status'];
  type?: ContentItem['type'];
  author?: string;
  tags?: string[];
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  byType: Record<string, number>;
  recentActivity: ContentItem[];
}

// Initialize Firebase for shared services (lazy initialization)
let db: Firestore, storage: any;
let firebaseInitialized = false;

const initializeFirebase = (): { db: Firestore, storage: any } => {
  if (firebaseInitialized && db && storage) {
    return { db, storage };
  }

  try {
    const firebaseConfig = configManager.getFirebaseConfig();
    if (firebaseConfig.apiKey) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      storage = getStorage(app);
      firebaseInitialized = true;
      console.log('Content service Firebase initialized successfully');
      return { db, storage };
    } else {
      throw new Error('Firebase configuration not found. Please check your environment variables.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase in content service:', error);
    throw error;
  }
};

class ContentManagementService {
  private static instance: ContentManagementService;
  private collectionName = 'content';

  private constructor() {}

  static getInstance(): ContentManagementService {
    if (!ContentManagementService.instance) {
      ContentManagementService.instance = new ContentManagementService();
    }
    return ContentManagementService.instance;
  }

  /**
   * Create new content item
   */
  async createContent(contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const createOperation = async () => {
      // Validate content before creating
      const validation = await contentValidator.validateContent(contentData);
      
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Content validation failed: ${errorMessages}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Content validation warnings:', validation.warnings);
      }

      const { db: firestoreDb } = initializeFirebase();
      const now = Timestamp.now();
      const content: Omit<ContentItem, 'id'> = {
        ...contentData,
        createdAt: now,
        updatedAt: now,
        status: contentData.status || 'draft',
        validationScore: validation.score
      };

      const docRef = await addDoc(collection(firestoreDb, this.collectionName), content);
      console.log('Content created:', docRef.id, `Validation score: ${validation.score}`);

      // Trigger real-time sync
      await syncService.triggerManualSync(this.collectionName, docRef.id);

      return docRef.id;
    };

    try {
      const result = await retryService.executeDatabaseRetry(createOperation);
      
      if (!result.success) {
        throw new Error(`Failed to create content after ${result.attempts} attempts: ${result.error?.message}`);
      }

      return result.result!;
    } catch (error) {
      console.error('Error creating content:', error);
      throw new Error('Failed to create content');
    }
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<ContentItem | null> {
    try {
      const { db: firestoreDb } = initializeFirebase();
      const docRef = doc(firestoreDb, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ContentItem;
      }

      return null;
    } catch (error) {
      console.error('Error getting content:', error);
      throw new Error('Failed to get content');
    }
  }

  /**
   * Update existing content
   */
  async updateContent(id: string, updates: Partial<ContentItem>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
        updatedBy: updates.updatedBy || 'system'
      };

      // If publishing, set publishedAt timestamp
      if (updates.status === 'published' && !updates.publishedAt) {
        updateData.publishedAt = Timestamp.now();
      }

      const { db: firestoreDb } = initializeFirebase();
      await updateDoc(doc(firestoreDb, this.collectionName, id), updateData);
      console.log('Content updated:', id);

      // Trigger real-time sync
      await syncService.triggerManualSync(this.collectionName, id);
    } catch (error) {
      console.error('Error updating content:', error);
      throw new Error('Failed to update content');
    }
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<void> {
    try {
      // Get content to check for media files to delete
      const content = await this.getContent(id);
      if (content && content.metadata?.mediaUrls) {
        await this.deleteMediaFiles(content.metadata.mediaUrls);
      }

      const { db: firestoreDb } = initializeFirebase();
      await deleteDoc(doc(firestoreDb, this.collectionName, id));
      console.log('Content deleted:', id);

      // Trigger real-time sync
      await syncService.triggerManualSync(this.collectionName);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }

  /**
   * Get content list with filters
   */
  async getContentList(filters: ContentFilters = {}): Promise<ContentItem[]> {
    try {
      const { db: firestoreDb } = initializeFirebase();
      let q: Query<DocumentData> = collection(firestoreDb, this.collectionName);

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.author) {
        q = query(q, where('author', '==', filters.author));
      }

      if (filters.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }

      // Always order by creation date descending
      q = query(q, orderBy('createdAt', 'desc'));

      // Apply limit if specified
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const content: ContentItem[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        content.push({
          id: doc.id,
          ...doc.data()
        } as ContentItem);
      });

      return content;
    } catch (error) {
      console.error('Error getting content list:', error);
      throw new Error('Failed to get content list');
    }
  }

  /**
   * Publish content (workflow management)
   */
  async publishContent(id: string, userId: string): Promise<void> {
    await this.updateContent(id, {
      status: 'published',
      publishedAt: Timestamp.now(),
      updatedBy: userId
    });

    // Send notification to all users
    await this.notifyContentPublication(id, userId);
  }

  /**
   * Submit content for review
   */
  async submitForReview(id: string, userId: string): Promise<void> {
    await this.updateContent(id, {
      status: 'review',
      updatedBy: userId
    });
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<ContentStats> {
    try {
      const allContent = await this.getContentList({ limit: 1000 });
      const stats: ContentStats = {
        total: allContent.length,
        published: 0,
        draft: 0,
        review: 0,
        byType: {},
        recentActivity: []
      };

      allContent.forEach(item => {
        // Count by status
        if (item.status === 'published') stats.published++;
        else if (item.status === 'draft') stats.draft++;
        else if (item.status === 'review') stats.review++;

        // Count by type
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      });

      // Get recent activity (last 10 items)
      stats.recentActivity = allContent
        .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds)
        .slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Error getting content stats:', error);
      throw new Error('Failed to get content statistics');
    }
  }

  /**
   * Upload media files
   */
  async uploadMedia(file: File, folder: string = 'content'): Promise<string> {
    try {
      const maxSize = configManager.getConfig().limits.maxUploadSize;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
      }

      const { storage: storageRef } = initializeFirebase();
      const fileName = `${Date.now()}_${file.name}`;
      const storageFileRef = ref(storageRef, `${folder}/${fileName}`);

      const snapshot = await uploadBytes(storageFileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Media uploaded:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media file');
    }
  }

  /**
   * Delete media files
   */
  private async deleteMediaFiles(urls: string[]): Promise<void> {
    try {
      const { storage: storageRef } = initializeFirebase();
      const deletePromises = urls.map(async (url) => {
        const fileRef = ref(storageRef, url);
        await deleteObject(fileRef);
      });

      await Promise.all(deletePromises);
      console.log('Media files deleted:', urls.length);
    } catch (error) {
      console.error('Error deleting media files:', error);
      // Don't throw here as content deletion should succeed even if media cleanup fails
    }
  }

  /**
   * Set up real-time listeners for content changes
   */
  setupRealtimeListeners(callback: (change: any) => void) {
    return syncService.addListener({
      id: 'content-management-listener',
      collection: this.collectionName,
      callback
    });
  }

  /**
   * Search content by text
   */
  async searchContent(searchTerm: string, filters: ContentFilters = {}): Promise<ContentItem[]> {
    try {
      // For now, get all content and filter client-side
      // In production, you might want to use Algolia or ElasticSearch
      const allContent = await this.getContentList({ ...filters, limit: 1000 });

      const searchLower = searchTerm.toLowerCase();
      return allContent.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.excerpt?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching content:', error);
      throw new Error('Failed to search content');
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateContent(ids: string[], updates: Partial<ContentItem>, userId: string): Promise<void> {
    try {
      const { db: firestoreDb } = initializeFirebase();
      const batch = writeBatch(firestoreDb);

      ids.forEach(id => {
        const docRef = doc(firestoreDb, this.collectionName, id);
        batch.update(docRef, {
          ...updates,
          updatedAt: Timestamp.now(),
          updatedBy: userId
        });
      });

      await batch.commit();
      console.log('Bulk update completed for', ids.length, 'items');

      // Trigger sync for all updated items
      await syncService.triggerManualSync(this.collectionName);
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to perform bulk update');
    }
  }

  /**
   * Send notification about content publication
   */
  private async notifyContentPublication(contentId: string, userId: string): Promise<void> {
    try {
      const content = await this.getContent(contentId);
      if (!content) return;

      const { db: firestoreDb } = initializeFirebase();
      const notificationRef = collection(firestoreDb, 'notifications');
      await addDoc(notificationRef, {
        type: 'content_published',
        title: 'New Content Published',
        message: `"${content.title}" is now live on the GSFP website`,
        targetUsers: ['all'],
        source: 'admin',
        contentId,
        createdAt: Timestamp.now(),
        read: false
      });
    } catch (error) {
      console.error('Error sending publication notification:', error);
    }
  }
}

// Export singleton instance
export const contentService = ContentManagementService.getInstance();

// Export convenience functions
export const createContent = (data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) =>
  contentService.createContent(data);
export const getContent = (id: string) => contentService.getContent(id);
export const updateContent = (id: string, updates: Partial<ContentItem>) =>
  contentService.updateContent(id, updates);
export const deleteContent = (id: string) => contentService.deleteContent(id);
export const getContentList = (filters?: ContentFilters) =>
  contentService.getContentList(filters);
export const publishContent = (id: string, userId: string) =>
  contentService.publishContent(id, userId);
export const submitForReview = (id: string, userId: string) =>
  contentService.submitForReview(id, userId);
export const getContentStats = () => contentService.getContentStats();
export const uploadMedia = (file: File, folder?: string) =>
  contentService.uploadMedia(file, folder);
export const searchContent = (term: string, filters?: ContentFilters) =>
  contentService.searchContent(term, filters);
export const bulkUpdateContent = (ids: string[], updates: Partial<ContentItem>, userId: string) =>
  contentService.bulkUpdateContent(ids, updates, userId);
