// Firebase configuration for frontend
// Now uses shared configuration system

import * as MockFirebase from './mockFirebase';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { configManager } from '../shared/config-manager';

let db, auth, storage, app;
let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) return;
  
  try {
    const config = configManager.getConfig();
    const firebaseConfig = configManager.getFirebaseConfig();
    
    if (config.isDevelopment || !firebaseConfig.apiKey) {
      // Use mock Firebase for local development and when Firebase credentials are not provided
      db = MockFirebase.db;
      auth = MockFirebase.auth;
      storage = MockFirebase.storage;
      app = MockFirebase.app;
      console.log('Using Mock Firebase services (Frontend)');
    } else {
      // Real Firebase for production when credentials are provided
      // Initialize Firebase
      app = initializeApp(firebaseConfig);

      // Initialize Cloud Firestore and get a reference to the service
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
      console.log('Using real Firebase services (Frontend)');
    }
    isInitialized = true;
  } catch (error) {
    console.warn('Firebase not initialized yet, using mock services:', error);
    // Fallback to mock services
    db = MockFirebase.db;
    auth = MockFirebase.auth;
    storage = MockFirebase.storage;
    app = MockFirebase.app;
    isInitialized = true;
  }
}

// Initialize immediately if possible, otherwise defer
try {
  initializeFirebase();
} catch (error) {
  // Config not ready yet, will be initialized by App.tsx
  console.log('Firebase initialization deferred until config is loaded');
}

// Export functions that ensure Firebase is initialized
export function getFirebaseServices() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return { db, auth, storage, app };
}

export { db, auth, storage };
export default app;

// Re-export Firebase functions from the appropriate source
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  serverTimestamp
} from './mockFirebase';
