import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, ArrowRight, Briefcase, CheckCircle2, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('microgig_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('microgig_token');
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionClick = (notif) => {
    if (!notif.isRead) markRead(notif._id);
    navigate('/dashboard');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pb-20 text-left">
      <div className="da-grid-bg pt-32 pb-16 border-b border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-daInfo-dark uppercase tracking-tight">Notifications</h1>
              <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">{unreadCount} UNREAD ALERTS</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="da-btn-outline text-xs px-4 py-2"
              >
                MARK ALL AS READ
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-daInfo-dark rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 border-4 border-black border-dashed text-center bg-gray-50">
             <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-daInfo-dark uppercase">No Notifications</h3>
             <p className="text-gray-400 font-medium mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`flex flex-col md:flex-row items-center gap-6 p-6 border-2 transition-all ${n.isRead ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-black da-shadow-black'}`}
              >
                <div className={`w-12 h-12 shrink-0 flex items-center justify-center border-2 border-black ${n.isRead ? 'bg-white text-gray-300' : 'bg-daInfo-pink text-white'}`}>
                  {n.type === 'apply' ? <Briefcase className="w-6 h-6" /> : 
                   n.type === 'hire' ? <CheckCircle2 className="w-6 h-6" /> : 
                   <Bell className="w-6 h-6" />}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-daInfo-pink" />}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {n.type} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`text-lg font-bold leading-tight ${n.isRead ? 'text-gray-500' : 'text-daInfo-dark'}`}>
                    {n.message}
                  </h4>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                   {!n.isRead && (
                     <button 
                       onClick={() => markRead(n._id)}
                       className="p-3 border-2 border-black hover:bg-gray-100 transition-colors"
                       title="Mark Read"
                     >
                       <Check className="w-5 h-5" />
                     </button>
                   )}
                   <button 
                     onClick={() => handleActionClick(n)}
                     className={`flex-1 md:flex-none px-6 py-3 font-black text-xs uppercase tracking-widest border-2 border-black transition-all ${n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-daInfo-dark text-white hover:bg-black da-shadow-black active:shadow-none'}`}
                   >
                     VIEW GIG
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
