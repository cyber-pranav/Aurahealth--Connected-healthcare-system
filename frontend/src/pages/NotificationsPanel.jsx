import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PRIORITY_CFG = {
  urgent: { color: 'bg-error text-on-error', dot: 'bg-error' },
  high: { color: 'bg-[#ef6c00] text-white', dot: 'bg-[#ef6c00]' },
  medium: { color: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary' },
  low: { color: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline' },
};

export default function NotificationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try { const r = await api.get('/notifications'); setNotifications(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await api.patch(`/notifications/${id}/read`); setNotifications(ns => ns.map(n => n._id === id ? { ...n, readStatus: true } : n)); }
    catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); setNotifications(ns => ns.map(n => ({ ...n, readStatus: true }))); }
    catch (e) { console.error(e); }
  };

  const generateSmart = async () => {
    setGenerating(true);
    try { await api.post('/notifications/generate'); loadNotifications(); }
    catch (e) { console.error(e); } finally { setGenerating(false); }
  };

  const handleClick = (n) => {
    if (!n.readStatus) markRead(n._id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.readStatus) : notifications.filter(n => n.type === filter);
  const types = ['all', 'unread', ...new Set(notifications.map(n => n.type))];

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-8 w-48 skeleton" />{[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary text-3xl">notifications</span>
            Notifications
            {unreadCount > 0 && <span className="px-2.5 py-0.5 bg-error text-on-error text-xs font-bold rounded-full">{unreadCount}</span>}
          </h1>
          <p className="text-on-surface-variant mt-1">Stay updated on your health journey</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateSmart} disabled={generating}
            className="px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-2xl text-sm font-semibold hover:bg-secondary-container/70 transition-all flex items-center gap-2 disabled:opacity-50">
            <span className={`material-symbols-outlined text-lg ${generating ? 'animate-spin' : ''}`}>{generating ? 'progress_activity' : 'auto_awesome'}</span>
            Smart Scan
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-4 py-2.5 border border-outline-variant/40 text-on-surface rounded-2xl text-sm font-medium hover:bg-surface-container-high transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">done_all</span>Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize
              ${filter === type ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high/50 border border-outline-variant/30'}`}>
            {type === 'all' ? 'All' : type === 'unread' ? `Unread (${unreadCount})` : type.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">notifications_off</span>
          <p className="text-on-surface-variant mt-4 text-lg font-medium">No notifications</p>
          <p className="text-on-surface-variant/60 mt-1 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => {
            const pri = PRIORITY_CFG[n.priority] || PRIORITY_CFG.low;
            return (
              <button key={n._id} onClick={() => handleClick(n)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:shadow-elevation-1 animate-slide-in stagger-${Math.min(i + 1, 5)}
                  ${n.readStatus ? 'bg-surface-container-lowest border-outline-variant/10 opacity-70' : 'bg-surface-container-lowest border-outline-variant/20 shadow-sm'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.readStatus ? 'bg-surface-container' : `${pri.color}`}`}>
                    <span className={`material-symbols-outlined ${n.readStatus ? '' : 'filled'} text-lg`}>{n.icon || 'notifications'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.readStatus && <span className={`w-2 h-2 rounded-full ${pri.dot} shrink-0`} />}
                      <h4 className={`text-sm font-semibold ${n.readStatus ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.title}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${pri.color}`}>{n.priority}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{n.message}</p>
                    <p className="text-[10px] text-on-surface-variant/50 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {n.actionUrl && (
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-lg mt-1 shrink-0">chevron_right</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
