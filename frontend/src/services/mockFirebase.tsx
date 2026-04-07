// Mock Firebase services for local development
// This replaces Firebase when NODE_ENV === 'development'

// @ts-nocheck
class MockAuth {
  currentUser: any;
  authStateListeners: any[];

  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    // Simulate logged in user in development
    setTimeout(() => {
      this.currentUser = {
        uid: 'mock-user-id',
        email: 'admin@example.com',
        displayName: 'Administrator',
        emailVerified: true,
        photoURL: null
      };
      callback(this.currentUser);
    }, 1000);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  async signInWithEmailAndPassword(email, password) {
    // Mock successful login
    this.currentUser = {
      uid: 'mock-user-id',
      email: email,
      displayName: 'Administrator',
      emailVerified: true,
      photoURL: null
    };
    this.authStateListeners.forEach(cb => cb(this.currentUser));
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email, password) {
    this.currentUser = {
      uid: 'mock-user-id-' + Date.now(),
      email: email,
      displayName: 'New User',
      emailVerified: false,
      photoURL: null
    };
    this.authStateListeners.forEach(cb => cb(this.currentUser));
    return { user: this.currentUser };
  }

  async signInWithPopup(provider) {
    this.currentUser = {
      uid: 'mock-google-user-id',
      email: 'google@example.com',
      displayName: 'Google User',
      emailVerified: true,
      photoURL: 'https://via.placeholder.com/100'
    };
    this.authStateListeners.forEach(cb => cb(this.currentUser));
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    this.authStateListeners.forEach(cb => cb(null));
  }

  async sendPasswordResetEmail(email) {
    console.log(`Mock: Password reset email sent to ${email}`);
  }

  async updateProfile(updates) {
    if (this.currentUser) {
      Object.assign(this.currentUser, updates);
      this.authStateListeners.forEach(cb => cb(this.currentUser));
    }
  }
}

class MockFirestore {
  constructor() {
    // Clear old cached mock data for production readiness
    localStorage.removeItem('mockFirestore');
    this.data = {};
    this.initializeSampleData();
    
    this.saveData = () => localStorage.setItem('mockFirestore', JSON.stringify(this.data));
  }

  initializeSampleData() {
    // Empty content collection - real data will come from Firebase in production
    this.data['content'] = {};
    
    console.log('Mock Firebase initialized with empty content collection');
  }

  collection(collectionName) {
    return new MockCollectionReference(this.data, collectionName, this.saveData);
  }
}

class MockCollectionReference {
  constructor(data, collectionName, saveData) {
    this.data = data;
    this.collectionName = collectionName;
    this.saveData = saveData;
    if (!this.data[collectionName]) {
      this.data[collectionName] = {};
    }
  }

  doc(docId) {
    return new MockDoc(this.data, this.collectionName, docId, this.saveData);
  }

  async add(data) {
    const docId = 'mock-doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    this.data[this.collectionName][docId] = { ...data, id: docId };
    this.saveData();
    return { id: docId };
  }

  async get() {
    const docs = Object.values(this.data[this.collectionName]).map(data => ({
      id: data.id,
      data: () => data,
      exists: () => true,
      metadata: {
        hasPendingWrites: false
      }
    }));
    return { docs, forEach: (cb) => docs.forEach(cb) };
  }
}

class MockQuery {
  constructor(data, collectionName, saveData) {
    this.data = data;
    this.collectionName = collectionName;
    this.saveData = saveData;
    this.whereClauses = [];
    this.orderByClauses = [];
    this.limitCount = null;
  }

  where(field, op, value) {
    this.whereClauses.push({ field, op, value });
    return this;
  }

  orderBy(field, direction = 'asc') {
    this.orderByClauses.push({ field, direction });
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  async get() {
    let docs = Object.values(this.data[this.collectionName] || {});

    // Apply where clauses
    this.whereClauses.forEach(({ field, op, value }) => {
      if (op === '==') {
        docs = docs.filter(doc => doc[field] === value);
      } else if (op === 'array-contains') {
        docs = docs.filter(doc => doc[field] && Array.isArray(doc[field]) && doc[field].includes(value));
      }
    });

    // Apply order by
    if (this.orderByClauses.length > 0) {
      const { field, direction } = this.orderByClauses[0];
      docs.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // Handle date strings
        if (field === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // Apply limit
    if (this.limitCount) {
      docs = docs.slice(0, this.limitCount);
    }

    const mockDocs = docs.map(data => ({
      id: data.id,
      data: () => data,
      exists: () => true,
      metadata: {
        hasPendingWrites: false
      }
    }));

    return { docs: mockDocs, forEach: (cb) => mockDocs.forEach(cb) };
  }
}

class MockDoc {
  constructor(data, collectionName, docId, saveData) {
    this.data = data;
    this.collectionName = collectionName;
    this.docId = docId;
    this.saveData = saveData;
  }

  async set(data, options = {}) {
    if (options.merge) {
      this.data[this.collectionName][this.docId] = {
        ...this.data[this.collectionName][this.docId],
        ...data
      };
    } else {
      this.data[this.collectionName][this.docId] = data;
    }
    this.saveData();
  }

  async get() {
    const data = this.data[this.collectionName][this.docId];
    return {
      exists: () => !!data,
      data: () => data
    };
  }

  async update(updates) {
    if (this.data[this.collectionName][this.docId]) {
      Object.assign(this.data[this.collectionName][this.docId], updates);
      this.saveData();
    }
  }

  async delete() {
    delete this.data[this.collectionName][this.docId];
    this.saveData();
  }

  collection(subCollection) {
    const fullPath = `${this.collectionName}/${this.docId}/${subCollection}`;
    return new MockCollection(this.data, fullPath, this.saveData);
  }
}

class MockStorage {
  constructor() {
    this.files = JSON.parse(localStorage.getItem('mockStorage') || '{}');
    this.saveFiles = () => localStorage.setItem('mockStorage', JSON.stringify(this.files));
  }

  ref(path) {
    return new MockStorageRef(this.files, path, this.saveFiles);
  }
}

class MockStorageRef {
  constructor(files, path, saveFiles) {
    this.files = files;
    this.path = path;
    this.saveFiles = saveFiles;
  }

  async put(file) {
    // Mock upload - store file metadata
    this.files[this.path] = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: Date.now()
    };
    this.saveFiles();
    return {
      ref: this,
      metadata: this.files[this.path]
    };
  }

  async getDownloadURL() {
    // Return a data URL or placeholder
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(this.files[this.path]?.name || 'File')}`;
  }

  async delete() {
    delete this.files[this.path];
    this.saveFiles();
  }
}

// Mock Firebase App
class MockFirebaseApp {
  constructor() {
    this.auth = () => new MockAuth();
    this.firestore = () => new MockFirestore();
    this.storage = () => new MockStorage();
  }
}

// Export mock services
export const auth = new MockAuth();
export const db = new MockFirestore();
export const storage = new MockStorage();
export const app = new MockFirebaseApp();

// Mock Firebase functions
export const collection = (db, name) => db.collection(name);
export const doc = (db, collectionName, docId) => db.collection(collectionName).doc(docId);
export const query = (collectionRef, ...queryConstraints) => {
  let mockQuery = new MockQuery(db.data, collectionRef.collectionName, db.saveData);
  queryConstraints.forEach(constraint => {
    if (constraint.where) {
      mockQuery = mockQuery.where(...constraint.where);
    } else if (constraint.orderBy) {
      mockQuery = mockQuery.orderBy(...constraint.orderBy);
    } else if (constraint.limit) {
      mockQuery = mockQuery.limit(...constraint.limit);
    }
  });
  return mockQuery;
};
export const where = (field, op, value) => ({ where: [field, op, value] });
export const orderBy = (field, direction) => ({ orderBy: [field, direction] });
export const limit = (count) => ({ limit: [count] });
export const getDocs = (query) => query.get();
export const addDoc = (collectionRef, data) => collectionRef.add(data);
export const updateDoc = (docRef, updates) => docRef.update(updates);
export const deleteDoc = (docRef) => docRef.delete();
export const setDoc = (docRef, data, options) => docRef.set(data, options);
export const getDoc = (docRef) => docRef.get();

// Storage mocks
export const ref = (path) => storage.ref(path);
export const uploadBytes = (ref, file) => ref.put(file);
export const getDownloadURL = (ref) => ref.getDownloadURL();
export const deleteObject = (ref) => ref.delete();

// Auth mocks
export const createUserWithEmailAndPassword = (auth, email, password) => auth.createUserWithEmailAndPassword(email, password);
export const signInWithEmailAndPassword = (auth, email, password) => auth.signInWithEmailAndPassword(email, password);
export const signInWithPopup = (auth, provider) => auth.signInWithPopup(provider);
export const signOut = (auth) => auth.signOut();
export const onAuthStateChanged = (auth, callback) => auth.onAuthStateChanged(callback);
export const sendPasswordResetEmail = (auth, email) => auth.sendPasswordResetEmail(email);
export const updateProfile = (user, updates) => user.updateProfile(updates);

// Mock Google Auth Provider
export class GoogleAuthProvider {
  constructor() {
    this.providerId = 'google.com';
  }
}

// Mock server timestamp
export const serverTimestamp = () => ({ toDate: () => new Date() });

console.log('Mock Firebase services loaded for local development');
