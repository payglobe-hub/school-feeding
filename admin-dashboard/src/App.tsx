import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentManager from './pages/ContentManager';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Import shared services
import { configManager } from './shared/config-manager';
import { syncService } from './shared/sync-service';
import { getFirebaseServices } from './services/firebase';

function App() {
  // Initialize shared services on app startup
  React.useEffect(() => {
    // Initialize configuration
    try {
      const config = configManager.initialize();
      console.log('Admin Dashboard - Configuration initialized:', config.environment);

      // Validate configuration
      const validation = configManager.validateConfig();
      if (!validation.isValid) {
        console.warn('Configuration validation warnings:', validation.errors);
      }

      // Initialize Firebase services now that config is ready
      const firebaseServices = getFirebaseServices();
      console.log('Firebase services initialized:', firebaseServices ? 'Success' : 'Failed');

      // Initialize real-time sync for admin collections
      if (config.features.realTimeSync) {
        syncService.initialize(['articles', 'events', 'media', 'partners', 'content'])
          .then(() => console.log('Real-time sync initialized for admin'))
          .catch(error => console.error('Failed to initialize real-time sync:', error));
      }
    } catch (error) {
      console.error('Failed to initialize shared services:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-neutral-50 via-white to-ghana-neutral-100">
      <ErrorBoundary>
        <Sidebar />
        <div className="ml-64 min-h-screen">
          <Header />
          <main className="p-8 bg-transparent">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentManager />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default App;
