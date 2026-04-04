import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const patientNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/medications', icon: 'medication', label: 'Medications' },
    { to: '/timeline', icon: 'timeline', label: 'Timeline' },
    { to: '/care-plans', icon: 'assignment', label: 'Care Plans' },
    { to: '/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/chat', icon: 'chat', label: 'Messages' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  ];

  const doctorNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/timeline', icon: 'timeline', label: 'Timeline' },
    { to: '/care-plans', icon: 'assignment', label: 'Care Plans' },
    { to: '/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/chat', icon: 'chat', label: 'Messages' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  ];

  const caregiverNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/timeline', icon: 'timeline', label: 'Timeline' },
    { to: '/care-plans', icon: 'assignment', label: 'Care Plans' },
    { to: '/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  ];

  const navItems = user?.role === 'DOCTOR' ? doctorNav : user?.role === 'CAREGIVER' ? caregiverNav : patientNav;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest
        border-r border-outline-variant/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-elevation-1">
              <span className="material-symbols-outlined filled text-on-primary text-xl">cardiology</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface tracking-tight">Aura Health</h1>
              <p className="text-xs text-on-surface-variant -mt-0.5">Care Coordination</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 p-3 rounded-2xl bg-primary-container/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined filled text-on-primary text-lg">
                {user?.role === 'DOCTOR' ? 'stethoscope' : user?.role === 'CAREGIVER' ? 'family_restroom' : 'person'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
              <p className="text-xs text-on-surface-variant capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high/60'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-xl ${isActive ? 'filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-error text-on-error px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && item.to !== '/notifications' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium
              text-error hover:bg-error-container/30 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center px-4 lg:px-8 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors mr-3"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/notifications')} className="p-2 rounded-xl hover:bg-surface-container-high transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
