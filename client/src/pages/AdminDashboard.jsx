import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, Scale, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminModeration from '../components/admin/AdminModeration';
import AdminDisputes from '../components/admin/AdminDisputes';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4">Checking Admin authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-600 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Access Denied</h1>
        <p className="text-gray-500 text-sm max-w-sm mt-2 font-medium">
          You do not have administrator permissions to access this route. Please contact support if you believe this is an error.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 flex items-center gap-2 bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'moderation', label: 'User Moderation', icon: Users },
    { id: 'disputes', label: 'Disputes Queue', icon: Scale }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-100">
              Admin Ops Center
            </span>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mt-3">Platform Operations</h1>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              className="w-10 h-10 rounded-xl border object-cover"
              alt=""
            />
            <div className="text-left">
              <p className="font-extrabold text-sm text-gray-900 leading-none mb-1">{user.name}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Platform Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex border-b border-gray-200 gap-6 overflow-x-auto pb-px">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-wider transition-colors outline-none ${
                  isActive ? 'text-black font-extrabold' : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content renderer */}
        <div className="mt-8">
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'moderation' && <AdminModeration />}
          {activeTab === 'disputes' && <AdminDisputes />}
        </div>
      </div>
    </div>
  );
}
