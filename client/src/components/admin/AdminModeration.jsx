import { useState, useEffect } from 'react';
import { Search, Ban, UserCheck, ShieldAlert, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import api from '../../lib/api';

export default function AdminModeration() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [moderatingUser, setModeratingUser] = useState(null); // User object
  const [targetStatus, setTargetStatus] = useState(''); // 'suspended' or 'banned'
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ shown: false, title: '', message: '', onConfirm: null });

  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load user directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, page]);

  const handleStatusChangeSubmit = async () => {
    if (!reason.trim()) {
      toast.warning('Please enter a moderation reason.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/users/${moderatingUser._id}/status`, {
        status: targetStatus,
        reason
      });
      toast.success(`User successfully marked as ${targetStatus}.`);
      setModeratingUser(null);
      setReason('');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = (userId) => {
    setConfirmModal({
      shown: true,
      title: 'Reactivate Account',
      message: 'Are you sure you want to reactivate this user account and restore platform access?',
      onConfirm: async () => {
        try {
          await api.put(`/admin/users/${userId}/status`, {
            status: 'active',
            reason: 'Account reinstated by administrator.'
          });
          toast.success('User account reinstated successfully.');
          await fetchUsers();
        } catch (err) {
          toast.error('Failed to reinstate account.');
          console.error(err);
        }
      }
    });
  };

  const handlePromoteAdmin = (userId) => {
    setConfirmModal({
      shown: true,
      title: 'Promote to Administrator',
      message: 'WARNING: Are you sure you want to promote this user to an ADMIN? This grants full access to platform operations, databases, analytics, and moderation dashboards.',
      onConfirm: async () => {
        try {
          await api.put(`/admin/users/${userId}/role`, { role: 'admin' });
          toast.success('User successfully promoted to administrator.');
          await fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to promote user.');
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 leading-tight font-bold">User Directory & Trust Controls</h2>
        <p className="text-xs text-gray-500 mt-1 font-semibold">Audit user activity, manage account access status, and promote administrator permissions.</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-semibold outline-none w-full text-gray-700"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-700 outline-none w-full cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="freelancer">Freelancers</option>
              <option value="client">Clients</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-700 outline-none w-full cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-medium text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-450 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Access Status</th>
                <th className="py-4 px-6">Last Login</th>
                <th className="py-4 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-black animate-spin mx-auto mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Directory...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-400 italic">No matching users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4.5 px-6 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt=""
                        className="w-8 h-8 rounded-lg border border-gray-200 object-cover"
                      />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        u.role === 'client' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        u.status === 'suspended' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-gray-500 font-semibold">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-2">
                      {u.status === 'active' ? (
                        <>
                          <button
                            onClick={() => { setModeratingUser(u); setTargetStatus('suspended'); }}
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-amber-150 transition-colors"
                          >
                            <Ban className="w-3 h-3" /> Suspend
                          </button>
                          <button
                            onClick={() => { setModeratingUser(u); setTargetStatus('banned'); }}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-150 transition-colors"
                          >
                            <Ban className="w-3 h-3" /> Ban
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u._id)}
                          className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-150 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" /> Activate
                        </button>
                      )}

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteAdmin(u._id)}
                          className="inline-flex items-center bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-purple-150 transition-colors"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-6 border-t border-gray-150">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-250 font-bold uppercase tracking-wider text-[10px] hover:border-black disabled:opacity-30 transition-all rounded-lg"
            >
              Previous
            </button>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-1.5 border border-gray-250 font-bold uppercase tracking-wider text-[10px] hover:border-black disabled:opacity-30 transition-all rounded-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Moderation Form Modal */}
      {moderatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setModeratingUser(null)} />
          <div className="relative bg-white w-full max-w-md border border-gray-100 rounded-3xl shadow-2xl p-6 text-left animate-scale-in">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Confirm Account {targetStatus === 'suspended' ? 'Suspension' : 'Ban'}
                </h3>
              </div>
              <button
                onClick={() => setModeratingUser(null)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-4 leading-relaxed">
              You are about to update access status for <span className="font-bold text-gray-900">{moderatingUser.name}</span> ({moderatingUser.email}) to <span className="font-bold text-red-600 uppercase">{targetStatus}</span>. This will prevent login access or contract transactions.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450 mb-1.5">Reason for Action</label>
                <textarea
                  rows="3"
                  placeholder="Explain why this account is being suspended or banned..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-red-500 outline-none font-medium text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatusChangeSubmit}
                disabled={submitting}
                className="bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl flex-1 text-center justify-center flex items-center shadow-sm"
              >
                Confirm Moderation
              </button>
              <button
                onClick={() => setModeratingUser(null)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl text-center justify-center flex"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      {confirmModal.shown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
            onClick={() => setConfirmModal({ shown: false, title: '', message: '', onConfirm: null })} 
          />
          <div className="relative bg-white w-full max-w-md border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] p-6 text-left animate-scale-in">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-black">
                <ShieldAlert className="w-5 h-5 text-black" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  {confirmModal.title}
                </h3>
              </div>
              <button
                onClick={() => setConfirmModal({ shown: false, title: '', message: '', onConfirm: null })}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setSubmitting(true);
                  if (confirmModal.onConfirm) {
                    await confirmModal.onConfirm();
                  }
                  setSubmitting(false);
                  setConfirmModal({ shown: false, title: '', message: '', onConfirm: null });
                }}
                disabled={submitting}
                className="bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl flex-1 text-center justify-center flex items-center shadow-sm"
              >
                Confirm Action
              </button>
              <button
                onClick={() => setConfirmModal({ shown: false, title: '', message: '', onConfirm: null })}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl text-center justify-center flex"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
