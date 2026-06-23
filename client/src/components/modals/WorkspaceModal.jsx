import { useState, useEffect, useRef } from 'react';
import { Briefcase, Send, Paperclip, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import api from '../../lib/api';

export default function WorkspaceModal({ jobId, userRole, onClose, onRefresh, handlePay }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const toast = useToast();
  const chatEndRef = useRef(null);

  const fetchJobDetails = async () => {
    try {
      const { data } = await api.get(`/jobs/${jobId}`);
      setJob(data);
    } catch (err) {
      toast.error('Failed to load workspace details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    if (job && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.workspace]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
        <div className="relative bg-white border border-gray-100 p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
           <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin mx-auto mb-4" />
           <p className="font-bold text-xs uppercase tracking-widest text-gray-400">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isClient = userRole === 'client';
  const status = job.status;
  const isFreelancer = !isClient;

  // Timeline helpers
  const stages = [
    { key: 'OPEN', label: '1. Posted' },
    { key: 'IN_PROGRESS', label: '2. In Progress' },
    { key: 'WORK_SUBMITTED', label: '3. Submitted' },
    { key: 'APPROVED', label: '4. Approved' },
    { key: 'COMPLETED', label: '5. Completed' }
  ];

  const getStageIndex = (currentStatus) => {
    const statusUpper = currentStatus.toUpperCase();
    if (statusUpper === 'OPEN' || statusUpper === 'APPLICATION_RECEIVED') return 0;
    if (statusUpper === 'HIRED' || statusUpper === 'IN_PROGRESS' || statusUpper === 'REVISION_REQUESTED') return 1;
    if (statusUpper === 'WORK_SUBMITTED' || statusUpper === 'UNDER_REVIEW') return 2;
    if (statusUpper === 'APPROVED') return 3;
    if (statusUpper === 'COMPLETED') return 4;
    return 0;
  };

  const currentStageIdx = getStageIndex(status);

  // Actions
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('text', messageText);
      if (attachment) {
        formData.append('attachment', attachment);
      }
      await api.post(`/jobs/${jobId}/workspace/message`, formData);
      setMessageText('');
      setAttachment(null);
      await fetchJobDetails();
    } catch (err) {
      toast.error('Failed to post message.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!submitContent.trim()) {
      toast.warning('Please enter submission details.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/submit`, { content: submitContent });
      setSubmitContent('');
      setShowSubmitForm(false);
      toast.success('Work submitted successfully!');
      await fetchJobDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to submit work.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveWork = async () => {
    if (!window.confirm('Are you sure you want to approve this work? This will ready the payment for release.')) return;
    setSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/approve`);
      toast.success('Work approved! Ready for payment release.');
      await fetchJobDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to approve work.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.warning('Please enter revision comments.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/revision`, { feedback: revisionFeedback });
      setRevisionFeedback('');
      setShowRevisionForm(false);
      toast.success('Revision requested successfully.');
      await fetchJobDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to request revision.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl rounded-3xl border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-white text-daInfo-dark">
           <div className="flex items-center gap-3">
             <Briefcase className="w-5 h-5 text-black" />
             <div className="text-left">
               <h3 className="text-base font-bold uppercase tracking-tight leading-none mb-1.5">{job.title}</h3>
               <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">
                 Escrow Budget: ₹{job.budget?.max}
               </span>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-gray-50 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-xl transition-all duration-205"
           >
              <X className="w-4 h-4" />
           </button>
        </div>

        {/* Timeline Progress */}
        <div className="border-b border-gray-100 p-6 bg-gray-50/50 overflow-x-auto">
           <div className="flex items-center justify-between min-w-[600px] px-4">
             {stages.map((stage, idx) => {
               const isActive = idx <= currentStageIdx;
               const isCurrent = idx === currentStageIdx;
               return (
                 <div key={stage.key} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex flex-col items-center">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                         isCurrent ? 'bg-daInfo-dark text-white scale-110 shadow-md' :
                         isActive ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300 border border-gray-200'
                       }`}>
                          {isActive && !isCurrent ? '✓' : idx + 1}
                       </div>
                       <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${
                         isCurrent ? 'text-black font-bold' :
                         isActive ? 'text-emerald-600' : 'text-gray-400'
                       }`}>
                          {stage.label}
                       </span>
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 border-t-2 border-dashed ${
                        idx < currentStageIdx ? 'border-emerald-500' : 'border-gray-200'
                      }`} />
                    )}
                 </div>
               );
             })}
           </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           
           {/* Left Column: Details & Deliverables */}
           <div className="w-full md:w-1/3 border-r border-gray-100 p-6 overflow-y-auto space-y-6 text-left bg-gray-50/30">
              <div>
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Project Summary</h4>
                 <div className="border border-gray-100 p-5 bg-white text-xs font-medium text-daInfo-dark space-y-3 shadow-sm rounded-2xl">
                    <p className="flex items-center"><strong>Status:</strong> <span className="text-yellow-750 font-bold bg-yellow-50 px-2.5 py-0.5 rounded-lg border border-yellow-100 uppercase text-[10px] ml-1.5">{job.status}</span></p>
                    <p className="flex items-center"><strong>Payment:</strong> <span className="font-bold bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded-lg border border-gray-150 uppercase text-[10px] ml-1.5">{job.paymentStatus}</span></p>
                    <p className="border-t border-gray-100 mt-3 pt-3 leading-relaxed text-gray-400">{job.description}</p>
                 </div>
              </div>

              <div>
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Freelancer Details</h4>
                 {job.assignedTo ? (
                   <div className="border border-gray-100 p-4 bg-white flex items-center gap-3 shadow-sm rounded-2xl">
                      <img 
                        src={job.assignedTo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.assignedTo.name}`} 
                        className="w-10 h-10 rounded-xl border border-gray-100 object-cover" 
                        alt="" 
                      />
                      <div>
                         <p className="font-bold text-daInfo-dark text-xs">{job.assignedTo.name}</p>
                         <p className="text-[10px] text-yellow-600 font-bold">★ {job.assignedTo.rating || 'N/A'}</p>
                      </div>
                   </div>
                 ) : (
                   <p className="text-xs text-gray-400 italic">No freelancer assigned yet.</p>
                 )}
              </div>

              {job.submission?.content && (
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Submitted Deliverable</h4>
                   <div className="border border-gray-100 p-5 bg-white text-xs font-medium shadow-sm rounded-2xl">
                      <p className="text-gray-400 text-[9px] uppercase font-bold mb-2">Submitted on {new Date(job.submission.submittedAt).toLocaleDateString()}</p>
                      <p className="text-daInfo-dark whitespace-pre-wrap leading-relaxed mb-4">{job.submission.content}</p>
                      {job.submission.aiVerificationScore !== null && (
                        <div className="border border-purple-100 p-3 rounded-xl bg-purple-50/60">
                           <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-1">AI Audit Integrity: {job.submission.aiVerificationScore}%</p>
                           <p className="text-[10px] font-medium text-purple-600 italic">"{job.submission.aiVerificationNotes}"</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {job.revisionFeedback && (
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-2">Revision Instructions</h4>
                   <p className="border border-rose-100 p-4 bg-rose-50/30 text-xs font-semibold text-rose-850 whitespace-pre-wrap rounded-2xl">
                      {job.revisionFeedback}
                   </p>
                </div>
              )}
           </div>

           {/* Right Column: Chat/Updates Log */}
           <div className="flex-1 flex flex-col bg-gray-50/40 h-[350px] md:h-auto overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-4.5 text-left">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-daInfo-dark">Project Timeline Logs & Chat</h4>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
                 {job.workspace && job.workspace.length > 0 ? (
                   job.workspace.map((w, idx) => {
                     const isSenderMe = w.sender?._id?.toString() === (isClient ? job.poster?._id || job.poster : job.assignedTo?._id || job.assignedTo);
                     return (
                       <div key={idx} className={`max-w-[80%] p-4 border text-left text-xs rounded-2xl ${
                         isSenderMe 
                         ? 'bg-daInfo-dark text-white self-end rounded-tr-none shadow-sm border-transparent' 
                         : 'bg-white text-gray-800 border-gray-100 self-start rounded-tl-none shadow-sm'
                       }`}>
                          <div className="flex justify-between items-center gap-4 mb-2">
                             <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                                {w.sender?.name || 'System Log'}
                             </span>
                             <span className="text-[9px] opacity-50">
                                {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <p className="font-medium whitespace-pre-wrap leading-relaxed">{w.text}</p>
                          {w.attachments && w.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
                               {w.attachments.map((file, fIdx) => (
                                 <a 
                                   key={fIdx}
                                   href={file.url}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-500 text-black px-3.5 py-2 rounded-lg border border-amber-400/20 transition-all duration-200 hover:-translate-y-0.5"
                                 >
                                    <Paperclip className="w-3 h-3 text-black" /> {file.name || 'Attachment'}
                                 </a>
                               ))}
                            </div>
                          )}
                       </div>
                     );
                   })
                 ) : (
                   <p className="text-xs text-gray-400 italic my-auto">No progress notes logged yet.</p>
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-100 bg-white p-4 flex gap-3 items-center">
                 <input 
                   type="text"
                   placeholder="Post a progress update, ask a question, or leave a note..."
                   value={messageText}
                   onChange={(e) => setMessageText(e.target.value)}
                   disabled={submitting}
                   className="flex-1 p-3.5 border border-gray-200 rounded-xl focus:border-daInfo-dark outline-none font-medium text-xs bg-gray-50/50 focus:bg-white transition-all"
                 />
                 <div className="relative flex items-center">
                    <input 
                      type="file"
                      id="ws-file"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />
                    <label 
                      htmlFor="ws-file"
                      className={`p-3.5 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-colors bg-white text-gray-500 ${
                        attachment ? 'bg-amber-100 text-amber-800 border-amber-300' : ''
                      }`}
                    >
                       <Paperclip className="w-4 h-4" />
                    </label>
                 </div>
                 <button 
                   type="submit"
                   disabled={submitting}
                   className="p-3.5 bg-daInfo-dark hover:bg-black text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-6 bg-white flex flex-col gap-4">
           
           {/* Expandable Submission Forms */}
           {showSubmitForm && (
             <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50 text-left animate-scale-in shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-widest text-daInfo-dark mb-2">Upload Deliverable Details</h4>
                <textarea 
                  rows="4"
                  placeholder="Explain details of the work completed, attach file links, or notes..."
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:border-daInfo-dark focus:bg-white outline-none font-medium text-xs mb-4 resize-none"
                />
                <div className="flex gap-4">
                   <button 
                     onClick={handleSubmitWork}
                     disabled={submitting}
                     className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex-1 justify-center flex items-center"
                   >
                      SUBMIT FINAL WORK
                   </button>
                   <button 
                     onClick={() => setShowSubmitForm(false)}
                     className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                   >
                      CANCEL
                   </button>
                </div>
             </div>
           )}

           {showRevisionForm && (
             <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50 text-left animate-scale-in shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-2">Revision Feedback Comments</h4>
                <textarea 
                  rows="4"
                  placeholder="What specifically needs to be modified, polished, or corrected?..."
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:border-daInfo-dark focus:bg-white outline-none font-medium text-xs mb-4 resize-none"
                />
                <div className="flex gap-4">
                   <button 
                     onClick={handleRequestRevision}
                     disabled={submitting}
                     className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex-1 justify-center flex items-center"
                   >
                      SEND REVISION REQUEST
                   </button>
                   <button 
                     onClick={() => setShowRevisionForm(false)}
                     className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                   >
                      CANCEL
                   </button>
                </div>
             </div>
           )}

           {/* Primary Stage Actions */}
           <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                 Status: <span className="text-daInfo-dark font-extrabold">{job.status}</span>
              </div>
              <div className="flex gap-3">
                 {/* Freelancer actions */}
                 {isFreelancer && (job.status === 'IN_PROGRESS' || job.status === 'REVISION_REQUESTED') && !showSubmitForm && (
                    <button 
                      onClick={() => setShowSubmitForm(true)}
                      className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-daInfo-dark/15 flex items-center justify-center"
                    >
                       SUBMIT DELIVERABLE
                    </button>
                 )}

                 {/* Employer actions (Approved / Revisions) */}
                 {isClient && (job.status === 'WORK_SUBMITTED' || job.status === 'UNDER_REVIEW') && !showRevisionForm && (
                    <>
                       <button 
                         onClick={handleApproveWork}
                         disabled={submitting}
                         className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md text-xs font-bold uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                       >
                          APPROVE WORK
                       </button>
                       <button 
                         onClick={() => setShowRevisionForm(true)}
                         className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                       >
                          REQUEST REVISIONS
                       </button>
                    </>
                 )}

                 {/* Employer payment action (Release payment) */}
                 {isClient && job.status === 'APPROVED' && job.paymentStatus === 'READY_FOR_RELEASE' && (
                    <button 
                      onClick={() => {
                        handlePay(job._id, job.assignedTo?._id || job.assignedTo, job.title);
                        onClose();
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md text-xs font-bold uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center animate-pulse"
                    >
                       RELEASE PAYMENT (₹{job.budget?.max})
                    </button>
                 )}

                 <button 
                   onClick={onClose}
                   className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center"
                 >
                    CLOSE
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
