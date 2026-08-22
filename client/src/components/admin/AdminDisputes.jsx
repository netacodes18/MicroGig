import { useState, useEffect } from 'react';
import { AlertOctagon, HelpCircle, CheckCircle, Scale, MessageSquare, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { useToast } from '../ui/Toast';
import api from '../../lib/api';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Inspect Modal State
  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [disputeDetail, setDisputeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resolutionReason, setResolutionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState({ shown: false, outcome: null });

  const toast = useToast();

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data);
    } catch (err) {
      toast.error('Failed to load disputes queue.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/disputes/${id}`);
      setDisputeDetail(res.data);
    } catch (err) {
      toast.error('Failed to load dispute details.');
      console.error(err);
      setSelectedDisputeId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (selectedDisputeId) {
      fetchDisputeDetail(selectedDisputeId);
    } else {
      setDisputeDetail(null);
    }
  }, [selectedDisputeId]);

  const handleBeginReview = async () => {
    setSubmitting(true);
    try {
      await api.put(`/admin/disputes/${selectedDisputeId}/review`);
      toast.success('Dispute marked as under review.');
      await fetchDisputeDetail(selectedDisputeId);
      await fetchDisputes();
    } catch (err) {
      toast.error('Failed to update dispute status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = (outcome) => {
    if (!resolutionReason.trim()) {
      toast.warning('Please enter a resolution reasoning comment.');
      return;
    }
    setConfirmResolve({ shown: true, outcome });
  };

  const executeResolve = async (outcome) => {
    setSubmitting(true);
    try {
      await api.put(`/admin/disputes/${selectedDisputeId}/resolve`, {
        resolutionOutcome: outcome,
        resolutionReason
      });
      toast.success('Dispute resolved and payout actions processed successfully.');
      setSelectedDisputeId(null);
      setResolutionReason('');
      await fetchDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve dispute.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group disputes by status column
  const cols = {
    OPEN: disputes.filter(d => d.status === 'OPEN'),
    UNDER_REVIEW: disputes.filter(d => d.status === 'UNDER_REVIEW'),
    RESOLVED: disputes.filter(d => d.status === 'RESOLVED' || d.status === 'REJECTED')
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 leading-tight font-bold">Dispute Resolution Workspace</h2>
        <p className="text-xs text-gray-500 mt-1 font-semibold">Moderate contract conflicts, audit workspace communications history, and authorize escrow refunds or releases.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading disputes queue...</p>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: OPEN */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">1. Open Queue</span>
              <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{cols.OPEN.length}</span>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {cols.OPEN.length === 0 ? (
                <div className="bg-white border border-gray-150 p-6 rounded-2xl text-center text-xs text-gray-400 italic">No open disputes.</div>
              ) : (
                cols.OPEN.map(d => (
                  <DisputeCard key={d._id} dispute={d} onClick={() => setSelectedDisputeId(d._id)} />
                ))
              )}
            </div>
          </div>

          {/* Column 2: UNDER REVIEW */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">2. Under Review</span>
              <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{cols.UNDER_REVIEW.length}</span>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {cols.UNDER_REVIEW.length === 0 ? (
                <div className="bg-white border border-gray-150 p-6 rounded-2xl text-center text-xs text-gray-400 italic">No disputes under review.</div>
              ) : (
                cols.UNDER_REVIEW.map(d => (
                  <DisputeCard key={d._id} dispute={d} onClick={() => setSelectedDisputeId(d._id)} />
                ))
              )}
            </div>
          </div>

          {/* Column 3: RESOLVED */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">3. Archive Logs</span>
              <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{cols.RESOLVED.length}</span>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {cols.RESOLVED.length === 0 ? (
                <div className="bg-white border border-gray-150 p-6 rounded-2xl text-center text-xs text-gray-400 italic">No resolved disputes.</div>
              ) : (
                cols.RESOLVED.map(d => (
                  <DisputeCard key={d._id} dispute={d} onClick={() => setSelectedDisputeId(d._id)} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Resolution Modal */}
      {selectedDisputeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedDisputeId(null)} />
          <div className="relative bg-white w-full max-w-4xl border border-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-white">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-black" />
                <div className="text-left">
                  <h3 className="text-base font-bold uppercase tracking-tight leading-none mb-1">Audit Dispute Workspace</h3>
                  <span className="text-[10px] font-bold text-gray-400">Dispute ID: {selectedDisputeId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDisputeId(null)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading || !disputeDetail ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-black animate-spin mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading details...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Dispute Context */}
                <div className="w-full md:w-1/2 border-r border-gray-100 p-6 overflow-y-auto space-y-6 text-left bg-gray-50/30">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Claim Summary</h4>
                    <div className="border border-gray-100 p-5 bg-white shadow-sm rounded-2xl space-y-3">
                      <p className="text-xs"><strong>Raised By:</strong> <span className="font-bold text-gray-700">{disputeDetail.raisedBy?.name}</span></p>
                      <p className="text-xs"><strong>Claim Reason:</strong> <span className="text-red-750 font-bold bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase text-[10px] ml-1">{disputeDetail.reason}</span></p>
                      <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3 mt-3">"{disputeDetail.description}"</p>
                      {disputeDetail.evidenceUrls?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Submitted Evidence:</p>
                          {disputeDetail.evidenceUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              Evidence Link {idx + 1} <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Parties Involved</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Client */}
                      <div className="border border-gray-100 p-4 bg-white shadow-sm rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mb-3">Client</span>
                        <img src={disputeDetail.job?.poster?.avatar} className="w-10 h-10 rounded-full border mb-2" alt="" />
                        <p className="font-bold text-xs text-gray-900">{disputeDetail.job?.poster?.name}</p>
                        <p className="text-[9px] text-gray-450 mt-0.5">{disputeDetail.job?.poster?.email}</p>
                      </div>

                      {/* Freelancer */}
                      <div className="border border-gray-100 p-4 bg-white shadow-sm rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 mb-3">Freelancer</span>
                        <img src={disputeDetail.job?.assignedTo?.avatar} className="w-10 h-10 rounded-full border mb-2" alt="" />
                        <p className="font-bold text-xs text-gray-900">{disputeDetail.job?.assignedTo?.name}</p>
                        <p className="text-[9px] text-gray-450 mt-0.5">{disputeDetail.job?.assignedTo?.email}</p>
                      </div>
                    </div>
                  </div>

                  {disputeDetail.status === 'RESOLVED' || disputeDetail.status === 'REJECTED' ? (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Resolution Log</h4>
                      <div className="border border-emerald-150 p-5 bg-emerald-50/20 shadow-sm rounded-2xl space-y-2 text-xs">
                        <p><strong>Outcome:</strong> <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-250 uppercase text-[10px] ml-1">{disputeDetail.resolutionOutcome}</span></p>
                        <p><strong>Reasoning:</strong> "{disputeDetail.resolutionReason}"</p>
                        <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-emerald-100/50">Resolved on {new Date(disputeDetail.resolvedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Right Side: Chat History logs / workspace */}
                <div className="flex-1 flex flex-col bg-gray-50/40 h-[350px] md:h-auto overflow-hidden">
                  <div className="bg-white border-b border-gray-100 p-4 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Project Chat & Workspace Logs</h4>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col max-h-[50vh] md:max-h-none">
                    {disputeDetail.job?.workspace?.length > 0 ? (
                      disputeDetail.job.workspace.map((w, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-4 text-left text-xs rounded-2xl shadow-sm self-start w-full">
                          <div className="flex justify-between items-center gap-4 mb-2 border-b border-gray-50 pb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                              {w.sender === disputeDetail.job.poster._id ? 'Client' : w.sender === disputeDetail.job.assignedTo._id ? 'Freelancer' : 'System'}
                            </span>
                            <span className="text-[9px] text-gray-300">
                              {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed">{w.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic my-auto">No workspace communication logs found.</p>
                    )}
                  </div>

                  {/* Resolution Input Actions (only shown if not resolved) */}
                  {disputeDetail.status === 'OPEN' || disputeDetail.status === 'UNDER_REVIEW' ? (
                    <div className="border-t border-gray-100 bg-white p-6 space-y-4 text-left">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Resolve Dispute</h4>
                      <textarea
                        rows="3"
                        placeholder="Provide details on the reasoning for this resolution decision..."
                        value={resolutionReason}
                        onChange={(e) => setResolutionReason(e.target.value)}
                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-red-500 outline-none font-medium text-xs resize-none"
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        {disputeDetail.status === 'OPEN' && (
                          <button
                            onClick={handleBeginReview}
                            disabled={submitting}
                            className="bg-black hover:bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-4.5 rounded-xl shadow-sm transition-all"
                          >
                            Mark Under Review
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve('RELEASE_PAYMENT')}
                          disabled={submitting}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-4.5 rounded-xl shadow-sm transition-all flex-1 text-center"
                        >
                          Release to Freelancer
                        </button>
                        <button
                          onClick={() => handleResolve('REFUND_CLIENT')}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-4.5 rounded-xl shadow-sm transition-all flex-1 text-center"
                        >
                          Refund Client
                        </button>
                        <button
                          onClick={() => handleResolve('SPLIT_PAYMENT')}
                          disabled={submitting}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-4.5 rounded-xl shadow-sm transition-all flex-1 text-center"
                        >
                          Split 50/50
                        </button>
                        <button
                          onClick={() => handleResolve('REJECTED')}
                          disabled={submitting}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider py-3 px-4.5 rounded-xl transition-all"
                        >
                          Reject Claim
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Resolve Dispute Modal */}
      {confirmResolve.shown && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
            onClick={() => setConfirmResolve({ shown: false, outcome: null })} 
          />
          <div className="relative bg-white w-full max-w-md border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] p-6 text-left animate-scale-in">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-black">
                <ShieldAlert className="w-5 h-5 text-black" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Confirm Dispute Resolution
                </h3>
              </div>
              <button
                onClick={() => setConfirmResolve({ shown: false, outcome: null })}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to resolve this dispute with outcome <span className="font-bold text-black uppercase">{confirmResolve.outcome?.replace('_', ' ')}</span>? This executes the corresponding financial payout or refund actions immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const outcome = confirmResolve.outcome;
                  setConfirmResolve({ shown: false, outcome: null });
                  await executeResolve(outcome);
                }}
                disabled={submitting}
                className="bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl flex-1 text-center justify-center flex items-center shadow-sm"
              >
                Execute Resolution
              </button>
              <button
                onClick={() => setConfirmResolve({ shown: false, outcome: null })}
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

// Internal DisputeCard Component
function DisputeCard({ dispute, onClick }) {
  const statusStyles = {
    OPEN: 'bg-red-50 text-red-700 border-red-100',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    REJECTED: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const getStatusLabel = () => {
    if (dispute.status === 'RESOLVED') return dispute.resolutionOutcome;
    return dispute.status;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 hover:border-black p-5 rounded-2xl text-left cursor-pointer transition-all shadow-sm da-shadow-black-hover"
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] font-bold text-gray-400">JOB ID: ...{dispute.job?._id?.slice(-6)}</span>
        <span className={`text-[9px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-lg ${statusStyles[dispute.status] || 'bg-gray-100 text-gray-600'}`}>
          {getStatusLabel()}
        </span>
      </div>
      <h3 className="font-bold text-gray-900 text-xs line-clamp-1 leading-tight mb-2 uppercase">{dispute.job?.title || 'Job Deleted'}</h3>
      <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mb-4 font-semibold">"{dispute.description}"</p>
      
      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500">{dispute.reason}</span>
        </div>
        <span className="text-[10px] font-black text-gray-800">₹{dispute.job?.budget?.max || dispute.job?.budget}</span>
      </div>
    </div>
  );
}
