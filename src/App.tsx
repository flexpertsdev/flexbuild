import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect, useState } from 'react';
import { authService } from './services/auth.service';
import { useAuthStore } from './stores/authStore';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing FlexBuild app...');
        
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          throw new Error('Not in browser environment');
        }

        // Check if IndexedDB is available
        if (!window.indexedDB) {
          throw new Error('IndexedDB not available');
        }

        // Check existing auth state
        await checkAuth();

        // Try to create demo users
        await authService.createDemoUsers();
        
        console.log('App initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        // Still set initialized to true so the app can render
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Initializing FlexBuild...</h2>
      </div>
    );
  }

  if (initError) {
    console.warn('App initialization error:', initError);
    // Still render the app even if there was an error
  }

  return <RouterProvider router={router} />;
}

export default App;