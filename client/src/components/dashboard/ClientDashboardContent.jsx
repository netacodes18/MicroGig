import { useState } from 'react';
import { Briefcase, User, Activity, Clock, FileText, ExternalLink, DollarSign } from 'lucide-react';

export default function ClientDashboardContent({ data, formatDate, actionLoading, handleAccept, handlePay, handleReject, handleHire, setWorkViewModal, setReviewModal, setWorkspaceModal }) {
  const { postedJobs, clientStats } = data;
  const [activeTab, setActiveTab] = useState('posted-jobs');

  // Helper to map and sanitize jobs by status categories
  const getJobsByStatus = (statuses) => {
    return postedJobs?.filter(job => {
      const statusUpper = (job.status || '').toUpperCase();
      return statuses.includes(statusUpper);
    }) || [];
  };

  // 1. Posted Gigs Tab (OPEN or APPLICATION_RECEIVED)
  const postedGigs = getJobsByStatus(['OPEN', 'APPLICATION_RECEIVED']);

  // 2. Applicants Tab
  const allApplicants = [];
  postedJobs?.forEach(job => {
    const statusUpper = (job.status || '').toUpperCase();
    if (statusUpper === 'OPEN' || statusUpper === 'APPLICATION_RECEIVED') {
      job.applicants?.forEach(app => {
        if (!app.status || app.status.toUpperCase() === 'PENDING') {
          allApplicants.push({ job, app });
        }
      });
    }
  });

  // 3. Active Projects Tab (HIRED or IN_PROGRESS or REVISION_REQUESTED)
  const activeProjects = getJobsByStatus(['HIRED', 'IN_PROGRESS', 'REVISION_REQUESTED']);

  // 4. Submitted Work Tab (WORK_SUBMITTED or UNDER_REVIEW)
  const submittedWork = getJobsByStatus(['WORK_SUBMITTED', 'UNDER_REVIEW']);

  // 5. Payments Tab (APPROVED)
  const payments = getJobsByStatus(['APPROVED']);

  // 6. Completed Projects Tab (COMPLETED)
  const completedProjects = getJobsByStatus(['COMPLETED']);

  // Tabs List
  const tabs = [
    { id: 'posted-jobs', label: 'Posted Gigs', count: postedGigs.length },
    { id: 'applicants', label: 'Applicants', count: allApplicants.length },
    { id: 'active-projects', label: 'Active Projects', count: activeProjects.length },
    { id: 'submitted-work', label: 'Submitted Work', count: submittedWork.length },
    { id: 'payments', label: 'Payments', count: payments.length },
    { id: 'completed-projects', label: 'Completed', count: completedProjects.length }
  ];

  return (
    <div className="space-y-12">
      {/* Metrics Section */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Employer Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Open Openings</p>
            <div className="flex items-end justify-between mt-auto">
               <span className="text-3xl font-extrabold text-daInfo-dark tracking-tight leading-none">{clientStats?.openOpenings || 0}</span>
               <Briefcase className="text-gray-300 w-8 h-8" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">People Hired</p>
            <div className="flex items-end justify-between mt-auto">
               <span className="text-3xl font-extrabold text-daInfo-dark tracking-tight leading-none">{clientStats?.peopleHired || 0}</span>
               <User className="text-gray-300 w-8 h-8" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Postings</p>
            <div className="flex items-end justify-between mt-auto">
               <span className="text-3xl font-extrabold text-daInfo-dark tracking-tight leading-none">{postedJobs?.length || 0}</span>
               <Activity className="text-gray-300 w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === t.id 
              ? 'bg-daInfo-dark text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span>{t.label}</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 transition-colors ${
              activeTab === t.id 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-200/60 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      
      {/* 1. Posted Gigs */}
      {activeTab === 'posted-jobs' && (
        <div className="space-y-4">
          {postedGigs.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No open job postings</h3>
               <p className="text-xs text-gray-500 mt-1">Gigs awaiting applicants will appear here.</p>
            </div>
          ) : (
            postedGigs.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div>
                  <h4 className="font-bold text-daInfo-dark text-lg leading-tight tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap gap-4 mt-2.5 text-xs font-semibold tracking-wider text-gray-500">
                    <span>Budget: <span className="text-gray-900 font-bold">₹{job.budget?.min} - ₹{job.budget?.max}</span></span>
                    <span>Applicants: <span className="text-gray-900 font-bold">{job.applicants?.length || 0}</span></span>
                    <span>Status: <span className="text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-lg border border-yellow-100 uppercase font-bold text-[10px]">{job.status}</span></span>
                    <span>Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('applicants')}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  VIEW APPLICANTS
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Applicants */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {allApplicants.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <User className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No active candidates</h3>
               <p className="text-xs text-gray-500 mt-1">Freelancers applying to your open gigs will be listed here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {allApplicants.map(({ job, app }, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-6">
                  
                  {/* Candidate Profile Header */}
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img 
                        src={app.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.name}`} 
                        className="w-12 h-12 rounded-xl border border-gray-100 object-cover bg-gray-50" 
                        alt="" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-daInfo-dark leading-none mb-1 text-base">{app.name}</h4>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest truncate">
                          Applied: {job.title}
                        </p>
                        <div className="flex gap-2 mt-2">
                           <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-100">
                             ★ {app.rating || 'N/A'}
                           </span>
                           {app.vibeMatch > 0 && (
                             <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">
                               AI Match: {app.vibeMatch}%
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Proposal Details */}
                    <div className="space-y-3 border-t border-gray-100 pt-4">
                       <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs text-daInfo-dark">
                         <strong className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px] font-bold">Proposal Pitch</strong>
                         <p className="italic font-medium leading-relaxed">"{app.message || 'No cover letter provided.'}"</p>
                       </div>
                       <p className="text-xs font-medium text-daInfo-dark">
                         <strong>Experience:</strong> {app.experience || 'No experience details specified.'}
                       </p>
                       <p className="text-xs font-medium text-daInfo-dark">
                         <strong>Contact:</strong> {app.contactInfo || 'No direct contact specified.'}
                       </p>
                       {app.portfolioUrl && (
                         <p className="text-xs font-medium text-daInfo-blue flex items-center gap-1">
                           <strong>Portfolio:</strong> 
                           <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-0.5 font-bold uppercase text-[9px]">
                              {app.portfolioUrl} <ExternalLink className="w-2.5 h-2.5" />
                           </a>
                         </p>
                       )}
                    </div>
                  </div>

                  {/* Skills & Bid details */}
                  <div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {app.skills?.slice(0, 4).map(s => (
                        <span key={s} className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[9px] uppercase font-bold tracking-widest text-gray-500">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border border-gray-100 rounded-xl p-4 bg-gray-50/30 mb-4 text-xs font-bold uppercase tracking-wider text-daInfo-dark">
                      <div>Bid: <span className="font-extrabold text-gray-900">₹{app.bidAmount || job.budget?.max}</span></div>
                      <div>Delivery: <span className="font-extrabold text-gray-900">{app.deliveryTime || job.duration}</span></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                       <button
                         onClick={() => handleHire(job._id, app.id)}
                         disabled={actionLoading}
                         className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex-1 justify-center text-center disabled:opacity-50"
                       >
                         HIRE
                       </button>
                       <button
                         onClick={() => {
                           if (window.confirm(`Are you sure you want to reject ${app.name}?`)) {
                             handleReject(job._id, app.id);
                           }
                         }}
                         disabled={actionLoading}
                         className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex-1 justify-center text-center disabled:opacity-50"
                       >
                         REJECT
                       </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Active Projects */}
      {activeTab === 'active-projects' && (
        <div className="space-y-4">
          {activeProjects.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <Clock className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No active projects</h3>
               <p className="text-xs text-gray-500 mt-1">Once you hire a freelancer, the project workspace will display here.</p>
            </div>
          ) : (
            activeProjects.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-daInfo-dark text-lg leading-none">{job.title}</h4>
                     <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border border-yellow-100 bg-yellow-50 text-yellow-750">
                       {job.status}
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold tracking-wider text-gray-500">
                    <span>Budget: <span className="text-gray-900 font-bold">₹{job.budget?.max}</span></span>
                    <span>Assigned Freelancer: <span className="text-gray-900 font-bold">{job.assignedTo?.name || 'Assigned'}</span></span>
                    <span>Last Updated: {formatDate(job.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setWorkspaceModal({ shown: true, jobId: job._id })}
                  className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-daInfo-dark/15 flex items-center justify-center gap-2"
                >
                  OPEN WORKSPACE
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Submitted Work */}
      {activeTab === 'submitted-work' && (
        <div className="space-y-4">
          {submittedWork.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <FileText className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No submissions to review</h3>
               <p className="text-xs text-gray-500 mt-1">Freelancer deliverables awaiting your audit will appear here.</p>
            </div>
          ) : (
            submittedWork.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-daInfo-dark text-lg leading-none">{job.title}</h4>
                     <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-750 animate-pulse">
                       AWAITING AUDIT
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold tracking-wider text-gray-500">
                    <span>Submitted: <span className="text-gray-900 font-bold">{formatDate(job.submission?.submittedAt)}</span></span>
                    <span>Freelancer: <span className="text-gray-900 font-bold">{job.assignedTo?.name}</span></span>
                    {job.submission?.aiVerificationScore !== null && (
                      <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 border border-purple-150 rounded text-[10px]">AI Audit: {job.submission?.aiVerificationScore}%</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setWorkspaceModal({ shown: true, jobId: job._id })}
                  className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-daInfo-dark/15 flex items-center justify-center gap-2"
                >
                  REVIEW WORK & CHAT
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No pending releases</h3>
               <p className="text-xs text-gray-500 mt-1">Once you approve deliverables, payments will be ready to release here.</p>
            </div>
          ) : (
            payments.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-daInfo-dark text-lg leading-none">{job.title}</h4>
                     <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
                       APPROVED
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold tracking-wider text-gray-500">
                    <span>Freelancer: <span className="text-gray-900 font-bold">{job.assignedTo?.name}</span></span>
                    <span>Ready for release: <span className="text-emerald-600 font-bold">₹{job.budget?.max}</span></span>
                  </div>
                </div>
                <button
                  onClick={() => setWorkspaceModal({ shown: true, jobId: job._id })}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 animate-pulse"
                >
                  RELEASE ESCROW PAYMENT
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. Completed Projects */}
      {activeTab === 'completed-projects' && (
        <div className="space-y-4">
          {completedProjects.length === 0 ? (
            <div className="border border-gray-200 border-dashed rounded-2xl p-12 text-center bg-gray-50/30">
               <Activity className="w-8 h-8 text-gray-300 mx-auto mb-4" />
               <h3 className="font-bold text-daInfo-dark text-sm uppercase">No completed gigs</h3>
               <p className="text-xs text-gray-500 mt-1">Finished and paid projects will be listed here.</p>
            </div>
          ) : (
            completedProjects.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-daInfo-dark text-lg leading-none">{job.title}</h4>
                     <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-100 text-gray-600">
                       COMPLETED
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold tracking-wider text-gray-500">
                    <span>Paid Freelancer: <span className="text-gray-900 font-bold">{job.assignedTo?.name}</span></span>
                    <span>Amount Transferred: <span className="text-gray-900 font-bold">₹{job.budget?.max}</span></span>
                    <span>Paid Date: {formatDate(job.paymentDetails?.paidAt || job.updatedAt)}</span>
                  </div>
                  {job.paymentDetails?.paymentId && (
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-2">
                       Receipt Payment ID: {job.paymentDetails.paymentId} (Order ID: {job.paymentDetails.orderId})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                   <button
                     onClick={() => setWorkspaceModal({ shown: true, jobId: job._id })}
                     className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                   >
                     VIEW LOGS
                   </button>
                   <button
                     onClick={() => setReviewModal({ 
                       shown: true, 
                       jobId: job._id, 
                       revieweeId: job.assignedTo?._id || job.assignedTo, 
                       rating: 5, 
                       comment: '', 
                       title: `Review Freelancer for: ${job.title}` 
                     })}
                     className="bg-daInfo-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                   >
                     RATE FREELANCER
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
