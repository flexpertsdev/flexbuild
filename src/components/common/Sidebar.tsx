import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Settings, HelpCircle } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};