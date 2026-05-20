import { useState } from 'react';
import { Briefcase, User, Activity, ChevronDown, ChevronUp, CheckCircle, DollarSign, Award, Globe } from 'lucide-react';
import { useToast } from '../ui/Toast';
import api from '../../lib/api';

export default function ClientDashboardContent({ data, formatDate, actionLoading, handleAccept, handlePay, setWorkViewModal }) {
  const { postedJobs, clientStats } = data;
  const [expandedJobId, setExpandedJobId] = useState(null);
  const toast = useToast();

  return (
    <>
      <h2 className="text-lg font-bold text-daInfo-dark tracking-tight mb-4">EMPLOYER METRICS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Open Openings</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{clientStats?.openOpenings || 0}</span>
             <Briefcase className="text-gray-300 w-8 h-8" />
          </div>
        </div>
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">People Hired</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{clientStats?.peopleHired || 0}</span>
             <User className="text-gray-300 w-8 h-8" />
          </div>
        </div>
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Postings</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{postedJobs?.length || 0}</span>
             <Activity className="text-gray-300 w-8 h-8" />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-daInfo-dark tracking-tight mb-4">POSTED JOBS & APPLICANTS</h2>
      
      {postedJobs?.length === 0 ? (
        <div className="border border-gray-200 border-dashed p-12 text-center bg-gray-50">
           <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-4" />
           <h3 className="font-bold text-daInfo-dark">No jobs posted</h3>
           <p className="text-sm text-gray-500 mt-1">When you post a new gig, it will appear here along with its applicants.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postedJobs?.map(job => (
            <div key={job._id} className="border border-gray-200 bg-white overflow-hidden">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
              >
                <div>
                  <h4 className="font-bold text-daInfo-dark text-lg leading-tight">{job.title}</h4>
                  <div className="flex gap-4 mt-2 text-xs font-bold uppercase tracking-widest">
                    <span>Status: <span className={
                      job.status === 'open' ? 'text-green-600' : 
                      job.status === 'accepted' ? 'text-blue-600' :
                      job.status === 'needs-review' ? 'text-daInfo-pink' :
                      'text-gray-500'
                    }>{job.status}</span></span>
                    <span className="text-gray-500">Applicants: {job.applicants?.length || 0}</span>
                    <span className="hidden sm:inline">Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                   <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">{expandedJobId === job._id ? 'CLOSE' : 'VIEW TALENT'}</span>
                   {expandedJobId === job._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedJobId === job._id && (
                 <div className="bg-gray-50 border-t border-gray-200 p-5 md:p-8 animate-scale-in">
                   
                   {(job.status === 'needs-review' || job.status === 'accepted') && (
                     <>
                     <div className="mb-10 p-8 bg-white border-2 border-black da-shadow-black">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 border mt-2 sm:mt-0 ${job.status === 'accepted' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-pink-50 border-pink-200 text-daInfo-pink'}`}>
                            {job.status === 'accepted' ? 'READY FOR PAYMENT' : 'PENDING REVIEW'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <button 
                             onClick={() => setWorkViewModal({ shown: true, submission: job.submission, title: job.title })}
                             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-daInfo-blue hover:bg-daInfo-blue/5 transition-all group"
                           >
                              <Activity className="w-6 h-6 text-gray-300 group-hover:text-daInfo-blue mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-daInfo-blue">1. Review Work</span>
                           </button>

                           <button 
                             onClick={() => handleAccept(job._id)}
                             disabled={actionLoading || job.status === 'accepted'}
                             className={`flex flex-col items-center justify-center p-6 border-2 transition-all group ${
                               job.status === 'accepted' 
                               ? 'bg-blue-50 border-blue-200 cursor-default' 
                               : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                             }`}
                           >
                              <CheckCircle className={`w-6 h-6 mb-2 ${job.status === 'accepted' ? 'text-blue-500' : 'text-gray-300 group-hover:text-green-500'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                job.status === 'accepted' ? 'text-blue-500' : 'text-gray-400 group-hover:text-green-500'
                              }`}>
                                {job.status === 'accepted' ? 'COMPLETION ACCEPTED' : '2. Accept & Release Escrow'}
                              </span>
                           </button>
                        </div>

                        {job.status === 'completed' && (
                          <div className="mt-6 flex items-center justify-center gap-3 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                             <Award className="w-4 h-4" /> Work accepted. Escrow funds released.
                          </div>
                        )}

                        {job.status === 'needs-review' && (
                          <div className="mt-8 border-t border-gray-100 pt-8 text-center">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                               <Activity className="w-4 h-4" /> Please review the submission before proceeding
                             </p>
                          </div>
                        )}
                      </>
                    )}

                   <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">Talent Applications</h5>
                  
                  {job.applicants?.length > 0 ? (
                    <div className="grid lg:grid-cols-2 gap-4">
                      {job.applicants.map((app, idx) => (
                        <div key={idx} className="border border-gray-200 bg-white p-5 flex gap-4 hover:border-gray-300 transition-colors">
                           <img src={app.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.name}`} className="w-12 h-12 border border-gray-200 object-cover bg-gray-50 shrink-0" alt="" />
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between gap-2 mb-1">
                               <h6 className="font-bold text-daInfo-dark truncate">{app.name}</h6>
                               <span className="text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700 px-1.5 py-0.5 border border-yellow-200 shrink-0">★ {app.rating || 'N/A'}</span>
                             </div>
                             <p className="text-xs text-daInfo-dark font-bold mt-2">Exp: {app.experience || "Not specified"}</p>
                             <p className="text-xs text-gray-500 mt-1 mb-3 italic">"{app.message || "No cover letter provided."}"</p>
                             {app.contactInfo && (
                               <p className="text-[10px] font-black text-daInfo-blue mb-4 flex items-center gap-1">
                                 <Globe className="w-3 h-3" /> {app.contactInfo}
                               </p>
                             )}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                                <div className="flex flex-wrap gap-1">
                                  {app.skills?.slice(0, 3).map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] uppercase font-bold tracking-widest">{s}</span>)}
                                </div>
                                <div className="flex gap-2">
                                  {app.attachmentUrl && (
                                    <a 
                                      href={app.attachmentUrl.includes('cloudinary.com') ? app.attachmentUrl.replace('/upload/', '/upload/fl_attachment/') : app.attachmentUrl}
                                      download={app.attachmentName || 'resume.pdf'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 border border-daInfo-dark text-daInfo-dark text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-1"
                                      title={app.attachmentName}
                                    >
                                      VIEW PDF
                                    </a>
                                  )}
                                  {job.status === 'open' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePay(job._id, app.id, job.title);
                                      }}
                                      className="px-3 py-1 bg-daInfo-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                      HIRE & DEPOSIT
                                    </button>
                                  )}
                                </div>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                       <p className="text-sm font-medium text-gray-500">No applicants yet for this gig.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
