import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            {notifications.map((n) => {
              // Contextual Action Mapping
              const getAction = (notif) => {
                switch(notif.type) {
                  case 'submission': return 'REVIEW WORK';
                  case 'apply': return 'MANAGE GIG';
                  case 'hire': return 'MY DASHBOARD';
                  case 'payment': return 'VIEW EARNINGS';
                  case 'acceptance': return 'PROCEED TO PAY';
                  default: return 'VIEW GIG';
                }
              };

              const getTypeColor = (type) => {
                switch(type) {
                  case 'payment': return 'bg-daInfo-green';
                  case 'hire': return 'bg-daInfo-blue';
                  case 'submission': return 'bg-daInfo-pink';
                  case 'apply': return 'bg-daInfo-dark';
                  default: return 'bg-gray-400';
                }
              };

              return (
                <motion.div 
                  key={n._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl transition-all duration-300 border ${n.isRead ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
                >
                  {/* Sender Avatar or Icon */}
                  <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-gray-100 border border-gray-100`}>
                    {n.sender?.avatar ? (
                      <img src={n.sender.avatar} alt={n.sender.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bell className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                      <span className={`px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-tighter rounded-full ${getTypeColor(n.type)}`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {n.job?.title && (
                        <span className="text-[10px] font-bold text-daInfo-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          {n.job.title}
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`text-md md:text-lg font-bold leading-tight ${n.isRead ? 'text-gray-400' : 'text-daInfo-dark'}`}>
                      {n.message}
                    </h4>
                    
                    {!n.isRead && (
                      <p className="text-[9px] font-bold text-daInfo-pink mt-1 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-daInfo-pink animate-pulse" />
                        Action Required
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                     {!n.isRead && (
                       <button 
                         onClick={() => markRead(n._id)}
                         className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-daInfo-pink hover:text-white transition-all flex flex-col items-center justify-center gap-1 group"
                         title="Mark as Read"
                       >
                         <Check className="w-5 h-5" />
                       </button>
                     )}
                     <button 
                       onClick={() => handleActionClick(n)}
                       className={`flex-1 md:flex-none px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${n.isRead ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-daInfo-dark text-white hover:bg-black'}`}
                     >
                       {getAction(n)}
                     </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
