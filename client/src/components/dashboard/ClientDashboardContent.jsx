import { useState, useEffect } from 'react';
import { Briefcase, User, Activity, Clock, FileText, ExternalLink, DollarSign, Download, Search, ShieldCheck, CreditCard } from 'lucide-react';

export default function ClientDashboardContent({ data, formatDate, actionLoading, handleAccept, handlePay, handleReject, handleHire, setWorkViewModal, setReviewModal, setWorkspaceModal, setManageGigModal }) {
  const { postedJobs, clientStats } = data;
  const [activeTab, setActiveTab] = useState('posted-jobs');
  
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['posted-jobs', 'applicants', 'active-projects', 'submitted-work', 'payments', 'completed-projects', 'invoices'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch('/api/payments/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const responseData = await res.json();
        setInvoices(responseData.invoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Helper to safely format budget across all budget structures
  const formatBudget = (budget) => {
    if (!budget) return '₹0';
    if (typeof budget === 'number') return `₹${budget}`;
    if (typeof budget === 'object') {
      if (budget.min && budget.max) return `₹${budget.min} - ₹${budget.max}`;
      if (budget.max) return `₹${budget.max}`;
      if (budget.min) return `₹${budget.min}`;
    }
    return '₹0';
  };

  // Helper to map and sanitize jobs by status categories
  const getJobsByStatus = (statuses) => {
    return postedJobs?.filter(job => {
      const statusUpper = (job.status || '').toUpperCase();
      return statuses.includes(statusUpper);
    }) || [];
  };

  // 1. Posted Gigs Tab - All jobs posted by this employer
  const postedGigs = postedJobs || [];

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
    { id: 'completed-projects', label: 'Completed', count: completedProjects.length },
    { id: 'invoices', label: 'Billing & Invoices', count: invoices.length }
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full">
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
                    <span>Budget: <span className="text-gray-900 font-bold">{formatBudget(job.budget)}</span></span>
                    <span>Applicants: <span className="text-gray-900 font-bold">{job.applicants?.length || 0}</span></span>
                    <span>Status: <span className="text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-lg border border-yellow-100 uppercase font-bold text-[10px]">{job.status}</span></span>
                    <span>Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setManageGigModal({ shown: true, jobId: job._id })}
                    className="bg-black hover:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    MANAGE GIG ({job.applicants?.length || 0} APPLICANTS)
                  </button>
                  {['HIRED', 'IN_PROGRESS', 'WORK_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED'].includes((job.status || '').toUpperCase()) && (
                    <button
                      onClick={() => setWorkspaceModal({ shown: true, jobId: job._id })}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      OPEN WORKSPACE
                    </button>
                  )}
                </div>
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

      {/* 7. Billing & Invoices Hub */}
      {activeTab === 'invoices' && (() => {
        const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const escrowPending = activeProjects.concat(submittedWork, payments).reduce((sum, job) => sum + (job.budget?.max || 0), 0);
        const filteredInvoices = invoices.filter(inv => 
          (inv.jobTitle || '').toLowerCase().includes(invoiceSearch.toLowerCase()) || 
          (inv.paymentId || '').toLowerCase().includes(invoiceSearch.toLowerCase())
        );

        const handleExportCSV = () => {
          if (invoices.length === 0) return alert('No invoices available to export.');
          const headers = ['Date', 'Job Title', 'Payment ID', 'Amount (INR)', 'Currency'];
          const rows = invoices.map(inv => [
            new Date(inv.paidAt).toLocaleDateString(),
            `"${(inv.jobTitle || '').replace(/"/g, '""')}"`,
            inv.paymentId,
            inv.amount,
            inv.currency || 'INR'
          ]);
          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `Billing_Statement_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        };

        return (
          <div className="space-y-8 text-left">
            {/* Billing Summary Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-black text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between h-36">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent (Paid Out)</p>
                  <p className="text-3xl font-black text-white tracking-tight mt-2">₹{totalSpent.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{invoices.length} Settled Transactions</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/20 to-teal-950/20 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Escrow Committed</p>
                  <p className="text-3xl font-black text-emerald-950 tracking-tight mt-2">₹{escrowPending.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                  <span>Protected in Escrow</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Security</p>
                  <p className="text-sm font-black text-daInfo-dark tracking-tight mt-2">Razorpay Encrypted SSL</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  <span>Instant PDF Generation</span>
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Filter & Export Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search by gig title or payment ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-5 py-2.5 bg-white hover:bg-gray-100 text-daInfo-dark border border-gray-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> EXPORT CSV
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm">
              {loadingInvoices ? (
                <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Invoices & Receipts...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="font-black text-daInfo-dark uppercase tracking-widest mb-2">No Matching Invoices Found</h3>
                  <p className="text-sm text-gray-500 max-w-md">Once you complete jobs and release escrow payments, your tax receipts and PDF invoices will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
                        <th className="p-5 font-extrabold text-daInfo-dark">Date</th>
                        <th className="p-5 font-extrabold text-daInfo-dark">Gig Title</th>
                        <th className="p-5 font-extrabold text-daInfo-dark">Payment Reference</th>
                        <th className="p-5 font-extrabold text-daInfo-dark">Status</th>
                        <th className="p-5 text-right font-extrabold text-daInfo-dark">Amount</th>
                        <th className="p-5 text-center font-extrabold text-daInfo-dark">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.paymentId} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-5 text-xs font-bold text-gray-600">
                            {new Date(inv.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-5 text-sm font-black text-daInfo-dark">
                            {inv.jobTitle}
                          </td>
                          <td className="p-5 text-xs font-mono text-gray-500">
                            {inv.paymentId}
                          </td>
                          <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider text-[9px]">
                              <ShieldCheck className="w-3 h-3" /> RELEASED
                            </span>
                          </td>
                          <td className="p-5 text-sm font-black text-daInfo-dark text-right">
                            ₹{inv.amount.toLocaleString()}
                          </td>
                          <td className="p-5 text-center">
                            <button 
                              type="button"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('microgig_token');
                                  const res = await fetch(`/api/payments/invoices/${inv.jobId}/download`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (res.ok) {
                                    const blob = await res.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Invoice_${inv.jobTitle.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30)}_${inv.jobId}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                  } else {
                                    const errData = await res.json();
                                    alert(errData.message || 'Failed to download invoice');
                                  }
                                } catch (err) {
                                  alert('Network error downloading invoice');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-black hover:bg-daInfo-dark text-white font-black uppercase tracking-widest text-[9px] transition-all rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5"
                            >
                              <Download className="w-3 h-3" /> DOWNLOAD PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
