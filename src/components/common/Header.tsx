import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ChevronDown, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInProject = location.pathname.includes('/project/');

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary-600">FlexBuild</h1>
        {isInProject && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-neutral-700">
              {user?.displayName || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.displayName}
                </p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              
              <div className="border-t border-neutral-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOut();
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};