// Test setup for GSFP shared services
// Configures test environment and mocks

import { configManager } from './config-manager';

declare global {
  var testUtils: any;
}

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock Firebase for testing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock environment variables for testing
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.REACT_APP_FIREBASE_APP_ID = '1:123456789:web:abcdef123456';

// Set up config manager for tests
beforeAll(() => {
  configManager.initialize();
});

afterAll(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  createTestUser: () => ({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  }),
  createTestContent: (overrides = {}) => ({
    title: 'Test Article',
    content: 'Test content',
    excerpt: 'Test excerpt',
    author: 'Test Author',
    status: 'draft' as const,
    type: 'article' as const,
    tags: ['test'],
    featured: false,
    createdBy: 'test-user',
    updatedBy: 'test-user',
    ...overrides,
  }),
};
