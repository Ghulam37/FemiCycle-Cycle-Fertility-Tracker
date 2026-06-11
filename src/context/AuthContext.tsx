/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrorHandler';
import { SymptomLog } from '../types';

interface UserProfile {
  email: string;
  displayName: string;
  lastPeriodDate: string;
  cycleLength: number;
  lutealPhase: number;
  measurementUnit: 'F' | 'C';
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  symptomLogs: Record<string, SymptomLog>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveSymptomLog: (dateStr: string, log: SymptomLog) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [symptomLogs, setSymptomLogs] = useState<Record<string, SymptomLog>>({});

  // Listen to Authentication states
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create profile
        const profileRef = doc(db, 'users', currentUser.uid);
        try {
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data() as UserProfile);
          } else {
            // Document doesn't exist, bootstrap with default values
            const defaultProfile: UserProfile = {
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Tracker User',
              lastPeriodDate: '2026-06-01', // Relative default start date
              cycleLength: 28,
              lutealPhase: 14,
              measurementUnit: 'F',
              isPremium: false
            };
            await setDoc(profileRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }

        // Setup real-time listener for symptom logs
        const symptomLogsRef = collection(db, 'users', currentUser.uid, 'symptomLogs');
        const unsubSymptoms = onSnapshot(symptomLogsRef, (snapshot) => {
          const logs: Record<string, SymptomLog> = {};
          snapshot.forEach((docSnap) => {
            logs[docSnap.id] = docSnap.data() as SymptomLog;
          });
          setSymptomLogs(logs);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/symptomLogs`);
        });

        return () => {
          unsubSymptoms();
        };
      } else {
        setUserProfile(null);
        setSymptomLogs({});
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // When both auth status and profile fetch have succeeded, resolve loading
  useEffect(() => {
    if (user === null) {
      setLoading(false);
    } else if (user && userProfile) {
      setLoading(false);
    }
  }, [user, userProfile]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-In failed', error);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setLoading(false);
      console.error('Logout failed', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(profileRef, updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const saveSymptomLog = async (dateStr: string, log: SymptomLog) => {
    if (!user) return;
    const logRef = doc(db, 'users', user.uid, 'symptomLogs', dateStr);
    try {
      await setDoc(logRef, log);
      setSymptomLogs(prev => ({
        ...prev,
        [dateStr]: log
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/symptomLogs/${dateStr}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      userProfile,
      symptomLogs,
      loginWithGoogle,
      logout,
      updateProfile,
      saveSymptomLog
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
