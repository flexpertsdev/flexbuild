import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { authService } from './services/auth.service';

function App() {
  useEffect(() => {
    // Create demo users on first load
    authService.createDemoUsers().catch(console.error);
  }, []);

  return <RouterProvider router={router} />;
}

export default App
