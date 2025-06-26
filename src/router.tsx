import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { Dashboard } from '@/pages/Dashboard';
import { Project } from '@/pages/Project';
import { Builder } from '@/pages/Builder';
import { Preview } from '@/pages/Preview';
import { Export } from '@/pages/Export';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignupPage />
      }
    ]
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'project/:projectId',
        element: <Project />
      },
      {
        path: 'project/:projectId/screen/:screenId',
        element: <Project />
      },
      {
        path: 'project/:projectId/builder',
        element: <Builder />
      },
      {
        path: 'project/:projectId/preview',
        element: <Preview />
      },
      {
        path: 'project/:projectId/export',
        element: <Export />
      }
    ]
  }
]);