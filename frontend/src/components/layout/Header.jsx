import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export default function Header({ title }) {
  const user                        = useAuthStore(s => s.user);
  const [notifs, setNotifs]         = useState([]);
  const [showDrop, setShowDrop]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const dropRef                     = useRef(null);

  const unread = notifs.filter(n => !n.is_read).length;

  const loadNotifs = () => {
    setLoading(true);
    api.get('/notifications/').then(r => setNotifs(r.data.results ?? r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async id => {
    await api.post(`/notifications/${id}/read/`).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  const markAllRead = async () => {
    await api.post('/notifications/read-all/').catch(() => {});
    setNotifs(prev => prev.map(n => ({...n, is_read: true})));
  };

  const typeColor = {
    critical: 'bg-red-100 text-red-600',
    warning:  'bg-amber-100 text-amber-600',
    info:     'bg-blue-100 text-blue-600',
    success:  'bg-emerald-100 text-emerald-600',
  };

  const typeIcon = { critical: '🚨', warning: '⚠️', info: 'ℹ️', success: '✅' };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setShowDrop(!showDrop)}
            className="relative w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDrop && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-6 text-slate-400 text-sm animate-pulse">Loading...</div>
                ) : notifs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <p className="text-2xl mb-2">🎉</p>
                    <p>No notifications</p>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${typeColor[n.type] ?? 'bg-slate-100'}`}>
                      {typeIcon[n.type] ?? 'ℹ️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      {n.body && <p className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Welcome, {user?.first_name}</span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.first_name?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
