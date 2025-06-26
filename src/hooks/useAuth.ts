import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for authentication operations and state
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    checkAuth,
    clearError
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Enhanced sign in with navigation
  const handleSignIn = useCallback(async (
    email: string, 
    password: string,
    redirectTo: string = '/dashboard'
  ) => {
    try {
      await signIn(email, password);
      navigate(redirectTo);
    } catch (error) {
      // Error is already set in store
      console.error('Sign in error:', error);
    }
  }, [signIn, navigate]);

  // Enhanced sign up with navigation
  const handleSignUp = useCallback(async (
    email: string, 
    password: string, 
    displayName: string,
    redirectTo: string = '/dashboard'
  ) => {
    try {
      await signUp(email, password, displayName);
      navigate(redirectTo);
    } catch (error) {
      // Error is already set in store
      console.error('Sign up error:', error);
    }
  }, [signUp, navigate]);

  // Enhanced sign out with navigation
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      // Error is already set in store
      console.error('Sign out error:', error);
    }
  }, [signOut, navigate]);

  // Require authentication helper
  const requireAuth = useCallback((redirectTo: string = '/login') => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    return true;
  }, [isAuthenticated, isLoading, navigate]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
    checkAuth,
    clearError,
    requireAuth,
    
    // Computed values
    isGuest: !isAuthenticated && !isLoading,
    isPro: user?.role === 'pro',
    isEnterprise: user?.role === 'enterprise'
  };
};

/**
 * Hook to protect routes that require authentication
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook to redirect authenticated users away from auth pages
 */
export const useRedirectAuthenticated = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};