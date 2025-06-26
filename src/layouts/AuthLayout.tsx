import { Outlet } from 'react-router-dom';
import { useRedirectAuthenticated } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AuthLayout = () => {
  const { isLoading } = useRedirectAuthenticated();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="flex min-h-screen">
        {/* Left side - Auth form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Outlet />
        </div>

        {/* Right side - Feature showcase */}
        <div className="hidden lg:flex flex-1 bg-primary-600 text-white p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-bold mb-6">
              Build Apps Visually, <br />Deploy Production Code
            </h1>
            <p className="text-lg mb-8 text-primary-100">
              FlexBuild transforms your visual designs into production-ready React applications. 
              No coding required.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Drag & Drop Interface</h3>
                  <p className="text-sm text-primary-100">
                    Build your app visually with our intuitive component library
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Assistance</h3>
                  <p className="text-sm text-primary-100">
                    Our AI understands your intent and helps create complex features
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Export Production Code</h3>
                  <p className="text-sm text-primary-100">
                    Get clean, maintainable React + TypeScript code ready for deployment
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};