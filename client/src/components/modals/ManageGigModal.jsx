import { useState, useEffect } from 'react';
import { Briefcase, User, Clock, FileText, CheckCircle, ExternalLink, X, DollarSign, Send, MessageSquare } from 'lucide-react';
import { useToast } from '../ui/Toast';
import api from '../../lib/api';

export default function ManageGigModal({ jobId, onClose, onRefresh, handlePay }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'workspace' | 'details'
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${jobId}`);
      setJob(data);
    } catch (err) {
      toast.error('Failed to load gig details.');
      console.error(err);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleHire = async (freelancerId) => {
    setActionLoading(true);
    try {
      await api.post(`/jobs/${jobId}/hire`, { freelancerId });
      toast.success('Freelancer hired successfully!');
      await fetchJob();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to hire freelancer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicantId) => {
    if (!window.confirm('Are you sure you want to reject this applicant?')) return;
    setActionLoading(true);
    try {
      await api.post(`/jobs/${jobId}/reject`, { applicantId });
      toast.success('Applicant rejected.');
      await fetchJob();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject applicant.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white border border-gray-100 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100">
             <X className="w-4 h-4" />
           </button>
           <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin mx-auto mb-4" />
           <p className="font-bold text-xs uppercase tracking-widest text-gray-400">Loading Gig Details...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const applicants = job.applicants || [];
  const statusUpper = (job.status || '').toUpperCase();
  const isAssigned = ['HIRED', 'IN_PROGRESS', 'WORK_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED'].includes(statusUpper);

  const formatBudget = (budget) => {
    if (!budget) return '$0';
    if (typeof budget === 'number') return `$${budget}`;
    if (typeof budget === 'object') {
      if (budget.min && budget.max) return `$${budget.min} - $${budget.max}`;
      if (budget.max) return `$${budget.max}`;
      if (budget.min) return `$${budget.min}`;
    }
    return '$0';
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />

      {/* Main Container */}
      <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-lg">
                {job.category || 'GIG MANAGEMENT'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-lg">
                STATUS: {job.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-daInfo-dark tracking-tight leading-tight">
              {job.title}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-gray-500">
              <span>Budget: <strong className="text-gray-900">{formatBudget(job.budget)}</strong></span>
              <span>Duration: <strong className="text-gray-900">{job.duration || 'Flexible'}</strong></span>
              <span>Applicants: <strong className="text-gray-900">{applicants.length}</strong></span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-white border border-transparent hover:border-gray-200 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-white px-6 pt-2 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'applicants' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Applicants</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px]">{applicants.length}</span>
          </button>

          {isAssigned && (
            <button
              onClick={() => setActiveTab('workspace')}
              className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'workspace' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Active Workspace</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Gig Scope & Details</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: APPLICANTS */}
          {activeTab === 'applicants' && (
            <div>
              {applicants.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-daInfo-dark text-base uppercase">No Applicants Yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto font-medium">
                    Your gig is active on the market. Top freelancers will apply soon, and their proposals will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applicants.map((app, idx) => {
                    const candidate = typeof app.user === 'object' ? app.user : { _id: app.user, name: 'Freelancer' };
                    const isPending = !app.status || app.status.toUpperCase() === 'PENDING';
                    const isHired = app.status?.toUpperCase() === 'HIRED' || String(job.assignedTo) === String(candidate._id);

                    return (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={candidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name || 'User'}`} 
                              alt="" 
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50" 
                            />
                            <div>
                              <h4 className="font-bold text-lg text-daInfo-dark">{candidate.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                  ★ {candidate.rating || '4.8'}
                                </span>
                                {app.vibeMatch > 0 && (
                                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                    AI Match: {app.vibeMatch}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isHired ? (
                              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> HIRED
                              </span>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl">
                                {app.status || 'PENDING'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pitch & Details */}
                        <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 border border-gray-100">
                          <p className="text-gray-700 font-medium italic">"{app.message || 'No proposal message specified.'}"</p>
                          {app.experience && <p className="text-gray-600"><strong>Experience:</strong> {app.experience}</p>}
                          {app.contactInfo && <p className="text-gray-600"><strong>Contact:</strong> {app.contactInfo}</p>}
                        </div>

                        {/* Bid Info */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs font-semibold text-gray-500">
                            Bid Amount: <strong className="text-gray-900">${app.bidAmount || job.budget?.max}</strong> | Delivery: <strong className="text-gray-900">{app.deliveryTime || job.duration}</strong>
                          </div>

                          {isPending && !isAssigned && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHire(candidate._id)}
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                              >
                                HIRE
                              </button>
                              <button
                                onClick={() => handleReject(candidate._id)}
                                disabled={actionLoading}
                                className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                              >
                                REJECT
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORKSPACE */}
          {activeTab === 'workspace' && isAssigned && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-blue-900 text-base">Project Workspace Active</h4>
                  <p className="text-xs text-blue-700 font-medium mt-1">
                    Communicate with your assigned freelancer, audit deliverables, and release payments securely.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    // Launch full workspace
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all shrink-0"
                >
                  OPEN LIVE WORKSPACE
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Scope</h4>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {job.skills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold uppercase text-gray-700 tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
