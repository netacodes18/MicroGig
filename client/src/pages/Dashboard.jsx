import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, Star, Briefcase, Calendar, Clock, CheckCircle, Activity, Award, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // wait for user
    
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('microgig_token');
        const res = await fetch('/api/users/me/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (!user && !localStorage.getItem('microgig_token')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="text-center p-12 max-w-md mx-4 border border-gray-200">
          <Activity className="w-12 h-12 text-daInfo-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-daInfo-dark mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-6">Log in to access your dashboard</p>
          <Link to="/login" className="da-btn-outline px-8">LOGIN</Link>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-daInfo-dark animate-spin" />
      </div>
    );
  }

  const { profile } = data;
  const isClient = profile.role === 'client';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white text-left">
      <div className="da-grid-bg pt-32 pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
               <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="Profile" className="w-24 h-24 border border-gray-200 bg-gray-50 object-cover" />
               <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-bold text-daInfo-dark tracking-tight mb-2">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1 border border-gray-200 px-2 py-1"><CheckCircle className="w-3 h-3" /> {profile.role}</span>
                    {profile.dob && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> DOB: {formatDate(profile.dob)}</span>}
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Member since {new Date(profile.createdAt).getFullYear()}</span>
                  </div>
               </div>
            </div>
            
            {isClient ? (
               <Link to="/jobs/new" className="da-btn-outline bg-daInfo-dark text-white">POST A GIG</Link>
            ) : (
               <Link to="/jobs" className="da-btn-outline">BROWSE DOMAINS</Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isClient ? <ClientDashboardContent data={data} formatDate={formatDate} /> : <FreelancerDashboardContent data={data} formatDate={formatDate} />}
      </div>
    </div>
  );
}

// ----- CLIENT DASHBOARD -----
function ClientDashboardContent({ data, formatDate }) {
  const { postedJobs, clientStats } = data;
  const [expandedJobId, setExpandedJobId] = useState(null);

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
                  <div className="flex gap-4 mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Status: <span className={job.status === 'open' ? 'text-green-600' : 'text-gray-500'}>{job.status}</span></span>
                    <span>Applicants: {job.applicants?.length || 0}</span>
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
                             <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-2 italic">"{app.message || "No cover letter provided."}"</p>
                             <div className="flex flex-wrap gap-1 mt-auto">
                               {app.skills?.slice(0, 3).map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] uppercase font-bold tracking-widest">{s}</span>)}
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

// ----- FREELANCER DASHBOARD -----
function FreelancerDashboardContent({ data, formatDate }) {
  const { recruitmentHistory, earnings, rating, completedGigs } = data;

  return (
    <>
      <h2 className="text-lg font-bold text-daInfo-dark tracking-tight mb-4">YOUR PROGRESS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Earnings</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-green-600">${(earnings || 0).toLocaleString()}</span>
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
        <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Applications</p>
          <div className="flex items-end justify-between mt-auto">
             <span className="text-3xl font-black text-daInfo-dark">{recruitmentHistory?.length || 0}</span>
             <Activity className="text-gray-300 w-8 h-8" />
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
            {recruitmentHistory?.map((historyItem, idx) => (
              <div key={idx} className="p-4 flex flex-col md:grid md:grid-cols-5 md:items-center hover:bg-gray-50 transition-colors">
                 <div className="col-span-2 mb-2 md:mb-0">
                    <h4 className="font-bold text-daInfo-dark leading-tight line-clamp-1">{historyItem.title}</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 flex items-center gap-1">
                       <Award className="w-3 h-3" /> {historyItem.role}
                    </p>
                 </div>
                 
                 <div className="text-sm text-gray-600 mb-2 md:mb-0 truncate pr-4">
                    <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Client:</span>
                    {historyItem.poster}
                 </div>
                 
                 <div className="mb-2 md:mb-0">
                    <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Status:</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${historyItem.status === 'open' ? 'border-blue-200 text-blue-700 bg-blue-50' : historyItem.status === 'in-progress' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : historyItem.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                       {historyItem.status}
                    </span>
                 </div>
                 
                 <div className="text-right text-sm font-medium text-gray-500 flex items-center md:justify-end gap-1">
                    <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Date:</span>
                    <Clock className="w-3 h-3" /> {formatDate(historyItem.date)}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
