// GSFP Stakeholder Authentication Hook
// Enhanced authentication for government stakeholders with role-based permissions

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthContextType, User } from '../types/auth';

// Enhanced stakeholder role definitions
export type StakeholderRole = 'admin' | 'editor' | 'coordinator' | 'viewer' | 'content_creator' | 'event_manager' | 'program_officer';

export interface StakeholderPermissions {
  canCreateContent: boolean;
  canEditContent: boolean;
  canPublishContent: boolean;
  canDeleteContent: boolean;
  canManageEvents: boolean;
  canUploadMedia: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canManagePartners: boolean;
  canUpdatePrograms: boolean;
  canScheduleEvents: boolean;
}

export interface StakeholderProfile {
  id: string;
  name: string;
  email: string;
  role: StakeholderRole;
  department: string;
  position: string;
  phone?: string;
  avatar?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
  permissions: StakeholderPermissions;
  departmentCode?: string;
}

// Role-based permission mapping
const rolePermissions: Record<StakeholderRole, StakeholderPermissions> = {
  admin: {
    canCreateContent: true,
    canEditContent: true,
    canPublishContent: true,
    canDeleteContent: true,
    canManageEvents: true,
    canUploadMedia: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canManagePartners: true,
    canUpdatePrograms: true,
    canScheduleEvents: true
  },
  editor: {
    canCreateContent: true,
    canEditContent: true,
    canPublishContent: true,
    canDeleteContent: false,
    canManageEvents: false,
    canUploadMedia: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canManagePartners: false,
    canUpdatePrograms: false,
    canScheduleEvents: false
  },
  coordinator: {
    canCreateContent: false,
    canEditContent: true,
    canPublishContent: false,
    canDeleteContent: false,
    canManageEvents: true,
    canUploadMedia: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canManagePartners: false,
    canUpdatePrograms: false,
    canScheduleEvents: true
  },
  viewer: {
    canCreateContent: false,
    canEditContent: false,
    canPublishContent: false,
    canDeleteContent: false,
    canManageEvents: false,
    canUploadMedia: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canManagePartners: false,
    canUpdatePrograms: false,
    canScheduleEvents: false
  },
  content_creator: {
    canCreateContent: true,
    canEditContent: true,
    canPublishContent: false,
    canDeleteContent: false,
    canManageEvents: false,
    canUploadMedia: true,
    canViewAnalytics: false,
    canManageUsers: false,
    canManagePartners: false,
    canUpdatePrograms: false,
    canScheduleEvents: false
  },
  event_manager: {
    canCreateContent: false,
    canEditContent: false,
    canPublishContent: false,
    canDeleteContent: false,
    canManageEvents: true,
    canUploadMedia: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canManagePartners: false,
    canUpdatePrograms: false,
    canScheduleEvents: true
  },
  program_officer: {
    canCreateContent: false,
    canEditContent: true,
    canPublishContent: false,
    canDeleteContent: false,
    canManageEvents: false,
    canUploadMedia: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canManagePartners: true,
    canUpdatePrograms: true,
    canScheduleEvents: false
  }
};

const StakeholderAuthContext = createContext<AuthContextType | undefined>(undefined);

export function useStakeholderAuth() {
  const context = useContext(StakeholderAuthContext);
  if (!context) {
    throw new Error('useStakeholderAuth must be used within a StakeholderAuthProvider');
  }
  return context;
}

export function StakeholderAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StakeholderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get stakeholder profile from Firestore
        const userDoc = await getDoc(doc(db, 'stakeholders', firebaseUser.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          const permissions = rolePermissions[profileData.role as StakeholderRole];
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || profileData.name || '',
            role: profileData.role as StakeholderRole,
            department: profileData.department || '',
            position: profileData.position || '',
            phone: profileData.phone,
            avatar: firebaseUser.photoURL || profileData.avatar,
            emailVerified: firebaseUser.emailVerified,
            isActive: profileData.isActive !== false,
            lastLogin: profileData.lastLogin?.toDate() || new Date(),
            permissions,
            departmentCode: profileData.departmentCode
          });
        } else {
          // Create stakeholder profile if it doesn't exist
          const defaultProfile = {
            name: firebaseUser.displayName || 'Stakeholder',
            role: 'editor' as StakeholderRole,
            department: 'General',
            position: 'Staff',
            avatar: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date()
          };

          await setDoc(doc(db, 'stakeholders', firebaseUser.uid), defaultProfile);
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: defaultProfile.name,
            role: defaultProfile.role,
            department: defaultProfile.department,
            position: defaultProfile.position,
            avatar: defaultProfile.avatar,
            emailVerified: defaultProfile.emailVerified,
            isActive: defaultProfile.isActive,
            lastLogin: defaultProfile.lastLogin,
            permissions: rolePermissions[defaultProfile.role]
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const registerStakeholder = async (
    email: string, 
    password: string, 
    name: string,
    role: StakeholderRole,
    department: string,
    position: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateFirebaseProfile(user, {
        displayName: name
      });

      // Create stakeholder profile in Firestore
      const stakeholderProfile = {
        name,
        role,
        department,
        position,
        phone: '',
        avatar: null,
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await setDoc(doc(db, 'stakeholders', user.uid), stakeholderProfile);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      if (user) {
        await updateDoc(doc(db, 'stakeholders', user.id), {
          lastLogin: new Date()
        });
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Create stakeholder profile if it doesn't exist
      const userDoc = await getDoc(doc(db, 'stakeholders', result.user.uid));
      if (!userDoc.exists()) {
        const stakeholderProfile = {
          name: result.user.displayName || 'Stakeholder',
          role: 'editor' as StakeholderRole,
          department: 'General',
          position: 'Staff',
          phone: '',
          avatar: result.user.photoURL,
          emailVerified: result.user.emailVerified,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        await setDoc(doc(db, 'stakeholders', result.user.uid), stakeholderProfile);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to logout' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const updateProfile = async (updates: Partial<StakeholderProfile>) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const updateData = { ...updates };
      delete updateData.id;
      delete updateData.permissions;

      await updateDoc(doc(db, 'stakeholders', user.id), updateData);
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updateData } : null);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const hasPermission = (permission: keyof StakeholderPermissions): boolean => {
    return user ? user.permissions[permission] : false;
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;
    
    const routePermissions: Record<string, StakeholderRole[]> = {
      '/': ['admin', 'editor', 'coordinator', 'viewer', 'content_creator', 'event_manager', 'program_officer'],
      '/content': ['admin', 'editor', 'content_creator'],
      '/events': ['admin', 'coordinator', 'event_manager'],
      '/analytics': ['admin', 'editor', 'coordinator', 'viewer', 'event_manager', 'program_officer'],
      '/partners': ['admin', 'program_officer'],
      '/programs': ['admin', 'program_officer'],
      '/settings': ['admin'],
      '/users': ['admin']
    };

    const allowedRoles = routePermissions[route] || [];
    return allowedRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    userProfile: user,
    login,
    registerStakeholder,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    hasPermission,
    canAccessRoute,
    loading
  };

  return (
    <StakeholderAuthContext.Provider value={value}>
      {children}
    </StakeholderAuthContext.Provider>
  );
}

function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.'
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}
