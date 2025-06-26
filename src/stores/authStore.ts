import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false, // Changed from true to false
        error: null,

        signIn: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const session = await authService.signIn(email, password);
            set({ 
              user: session.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Sign in failed',
              isLoading: false 
            });
            throw error;
          }
        },

        signUp: async (email: string, password: string, displayName: string) => {
          set({ isLoading: true, error: null });
          try {
            const session = await authService.signUp(email, password, displayName);
            set({ 
              user: session.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Sign up failed',
              isLoading: false 
            });
            throw error;
          }
        },

        signOut: async () => {
          set({ isLoading: true, error: null });
          try {
            await authService.signOut();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Sign out failed',
              isLoading: false 
            });
            throw error;
          }
        },

        updateProfile: async (updates: Partial<User>) => {
          set({ isLoading: true, error: null });
          try {
            const updatedUser = await authService.updateProfile(updates);
            set({ 
              user: updatedUser, 
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Profile update failed',
              isLoading: false 
            });
            throw error;
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const user = await authService.getCurrentUser();
            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        },

        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'auth-storage',
        partialize: () => ({ 
          // Don't persist sensitive data
          // The auth service handles session persistence
        })
      }
    ),
    {
      name: 'AuthStore'
    }
  )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Don't automatically check auth on store creation
// Let the app components handle initialization