import { Briefcase, Award, Clock, DollarSign, CheckCircle, Star, Activity, Globe, Github, Linkedin } from 'lucide-react';

export default function FreelancerDashboardContent({ profile, data, formatDate, setSubmissionModal, setWorkViewModal, handleReviewClient, setWorkspaceModal }) {
  const { recruitmentHistory, earnings, rating, completedGigs } = data;
  const { skills, portfolio } = profile;

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'OPEN') return 'border-blue-200 text-blue-700 bg-blue-50';
    if (s === 'APPLICATION_RECEIVED') return 'border-purple-200 text-purple-700 bg-purple-50';
    if (s === 'HIRED' || s === 'IN_PROGRESS') return 'border-yellow-200 text-yellow-700 bg-yellow-50';
    if (s === 'WORK_SUBMITTED' || s === 'UNDER_REVIEW') return 'border-blue-300 text-blue-800 bg-blue-50';
    if (s === 'REVISION_REQUESTED') return 'border-red-200 text-red-700 bg-red-50';
    if (s === 'APPROVED') return 'border-green-200 text-green-700 bg-green-50 animate-pulse';
    if (s === 'COMPLETED') return 'border-green-300 text-green-800 bg-green-100';
    return 'border-gray-200 text-gray-600 bg-gray-50';
  };

  const getStatusLabel = (statusStr) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'APPROVED') return 'APPROVED (AWAITING PAYMENT)';
    return s || 'APPLIED';
  };

  return (
    <>
      <h2 className="text-lg font-bold text-daInfo-dark tracking-tight mb-4">YOUR PROGRESS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Earnings</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-green-600">₹{(earnings || 0).toLocaleString()}</span>
             <DollarSign className="text-gray-300 w-8 h-8" />
          </div>
        </div>
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Gigs Completed</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{completedGigs || 0}</span>
             <CheckCircle className="text-gray-300 w-8 h-8" />
          </div>
        </div>
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Global Rating</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{rating || 'N/A'}</span>
             <Star className="text-gray-300 w-8 h-8 fill-gray-300" />
          </div>
        </div>
        <div className="border border-gray-200 bg-gray-50 p-4 sm:p-6 flex flex-col justify-between h-28 sm:h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Applications</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-2xl sm:text-3xl font-black text-daInfo-dark">{recruitmentHistory?.length || 0}</span>
             <Activity className="text-gray-300 w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="border border-gray-200 p-8 text-left bg-white">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <Award className="w-4 h-4" /> MASTERED SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-white border border-black text-[10px] font-bold uppercase tracking-widest da-shadow-black-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No skills added yet. Update in settings.</p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 p-8 text-left bg-white">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4" /> DIGITAL FOOTPRINT
          </h2>
          <div className="flex flex-wrap gap-6">
            {portfolio?.github && (
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-daInfo-dark hover:text-daInfo-blue transition-colors">
                <Github className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest border-b border-black">GITHUB</span>
              </a>
            )}
            {portfolio?.linkedin && (
              <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-daInfo-dark hover:text-daInfo-blue transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest border-b border-black">LINKEDIN</span>
              </a>
            )}
            {portfolio?.website && (
              <a href={portfolio.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-daInfo-dark hover:text-daInfo-blue transition-colors">
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest border-b border-black">WEBSITE</span>
              </a>
            )}
            {!portfolio?.github && !portfolio?.linkedin && !portfolio?.website && (
              <p className="text-sm text-gray-400 italic">No links added yet. Update in settings.</p>
            )}
          </div>
        </div>
      </div>
      <h2 className="text-lg font-bold text-daInfo-dark tracking-tight mb-4">RECRUITMENT HISTORY</h2>
      
      {recruitmentHistory?.length === 0 ? (
        <div className="border border-gray-200 border-dashed p-12 text-center bg-gray-50">
           <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-4" />
           <h3 className="font-bold text-daInfo-dark">No history yet</h3>
           <p className="text-sm text-gray-500 mt-1">When you apply or get assigned to micro-gigs, they will appear here.</p>
        </div>
      ) : (
        <div className="border border-gray-200 bg-white">
          <div className="hidden md:grid grid-cols-5 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold tracking-widest uppercase text-gray-500">
             <div className="col-span-2">Gig Role</div>
             <div>Client</div>
             <div>Status</div>
             <div className="text-right">Action Date</div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recruitmentHistory?.map((historyItem, idx) => {
              const statusUpper = (historyItem.status || '').toUpperCase();
              const isAssigned = historyItem.role === 'Assigned Worker';
              return (
                <div key={idx} className="p-4 flex flex-col md:grid md:grid-cols-5 md:items-center hover:bg-gray-50 transition-colors">
                   <div className="col-span-2 mb-2 md:mb-0">
                      <h4 className="font-bold text-daInfo-dark leading-tight line-clamp-1">{historyItem.title}</h4>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 flex items-center gap-1">
                         <Award className="w-3 h-3" /> {historyItem.role}
                      </p>
                   </div>
                   
                   <div className="text-sm text-gray-600 mb-2 md:mb-0 truncate pr-4 text-left">
                      <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Client:</span>
                      {historyItem.poster}
                   </div>
                   
                   <div className="text-left">
                      <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Status:</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusBadge(historyItem.status)}`}>
                        {getStatusLabel(historyItem.status)}
                      </span>
                   </div>
                   
                   <div className="text-right text-sm font-medium text-gray-500 flex items-center md:justify-end gap-1">
                      {isAssigned && (
                         <button 
                           onClick={() => setWorkspaceModal({ shown: true, jobId: historyItem._id })}
                           className="mr-4 text-[10px] font-black text-daInfo-blue border-b-2 border-daInfo-blue hover:text-daInfo-dark hover:border-daInfo-dark transition-all"
                         >
                           OPEN WORKSPACE
                         </button>
                      )}
                      
                      {statusUpper === 'COMPLETED' && (
                         <button 
                           onClick={() => handleReviewClient(historyItem._id, historyItem.posterId, historyItem.title)}
                           className="mr-4 text-[10px] font-black text-green-600 border-b-2 border-green-600 hover:text-daInfo-dark hover:border-daInfo-dark transition-all"
                         >
                           REVIEW CLIENT
                         </button>
                      )}
                      <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Date:</span>
                      <Clock className="w-3 h-3" /> {formatDate(historyItem.date)}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
