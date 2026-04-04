import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/medications', icon: 'medication', label: 'Medications' },
    { to: '/chat', icon: 'chat', label: 'Messages' },
  ];

  const doctorNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/chat', icon: 'chat', label: 'Messages' },
  ];

  const navItems = user?.role === 'DOCTOR' ? doctorNav : patientNav;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest
        border-r border-outline-variant/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-elevation-1">
              <span className="material-symbols-outlined filled text-on-primary text-xl">cardiology</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface tracking-tight">Aura Health</h1>
              <p className="text-xs text-on-surface-variant -mt-0.5">Healthcare Platform</p>
            </div>
          </div>
        </div>

        {/* User Badge */}
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-primary-container/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined filled text-on-primary text-lg">
                {user?.role === 'DOCTOR' ? 'stethoscope' : 'person'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
              <p className="text-xs text-on-surface-variant capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium
                transition-all duration-200 group
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
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center px-4 lg:px-8 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors mr-3"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-surface-container-high transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
