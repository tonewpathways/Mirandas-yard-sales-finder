import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  isAuthLoading: boolean;
  authError: string;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides Firebase Google Sign-In state and token retrieval helpers
 * across the entire application without persisting sensitive tokens in localStorage.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Subscribe to Firebase Auth session changes on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Opens the Google Sign-In popup and translates common popup errors
   * into friendly messages for the UI.
   */
  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in was cancelled. Please try again when ready.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Your browser blocked the sign-in popup. Please allow popups for this site and try again.'
        );
      } else {
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to sign in with Google right now. Please try again.'
        );
      }
      return null;
    }
  };

  /**
   * Signs the current user out of Firebase Auth.
   */
  const signOutUser = async (): Promise<void> => {
    setAuthError('');
    await signOut(auth);
  };

  /**
   * Retrieves a short-lived Firebase ID token directly in memory for Bearer API calls.
   */
  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
  };

  const clearAuthError = () => setAuthError('');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        authError,
        signInWithGoogle,
        signOutUser,
        getIdToken,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Convenience hook for reading the current Firebase Auth session and actions.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return ctx;
}
