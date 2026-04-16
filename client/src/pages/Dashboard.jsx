import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Activity, CheckCircle, Clock, Zap, Target, Search, Filter, 
  Settings as SettingsIcon, LogOut, ChevronDown, ChevronUp, Star, Award,
  DollarSign, FileText, Bot, Calendar, User, Github, Linkedin, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState({ shown: false, jobId: null, content: '' });
  const [reviewModal, setReviewModal] = useState({ shown: false, jobId: null, revieweeId: null, rating: 5, comment: '', title: '' });
  const [workViewModal, setWorkViewModal] = useState({ shown: false, content: '', title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

  const handleSubmitWork = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch(`/api/jobs/${submissionModal.jobId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: submissionModal.content })
      });
      if (res.ok) {
        setSubmissionModal({ shown: false, jobId: null, content: '' });
        window.location.reload();
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleAccept = async (jobId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch(`/api/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) window.location.reload();
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handlePay = async (jobId, freelancerId) => {
    // Payment confirmation is implicit — user clicked the Pay button
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('microgig_token');
      
      // 1. Load Razorpay script
      const resScript = await loadRazorpay();
      if (!resScript) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setActionLoading(false);
        return;
      }

      // 2. Create Order on Backend
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jobId })
      });

      const contentType = orderRes.headers.get("content-type");
      if (!orderRes.ok || !contentType || !contentType.includes("application/json")) {
        const text = await orderRes.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server Error (${orderRes.status}): Backend deployment might be pending or misconfigured.`);
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MicroGig Marketplace',
        description: `Payment for Job ID: ${jobId}`,
        order_id: orderData.id,
        handler: async (response) => {
          // 4. Verify Payment on Backend
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId
              })
            });

            const vContentType = verifyRes.headers.get("content-type");
            if (!verifyRes.ok || !vContentType || !vContentType.includes("application/json")) {
              throw new Error(`Verification Failed (${verifyRes.status}): Backend error.`);
            }

            const verifyData = await verifyRes.json();
            toast.success('Payment successful and verified!');
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
           color: '#0000FF'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) { 
      console.error(err); 
      toast.error(`Payment Error: ${err.message}`);
    }
    finally { setActionLoading(false); }
  };

  const handleReviewClient = (jobId, clientId, jobTitle) => {
    setReviewModal({ shown: true, jobId, revieweeId: clientId, rating: 5, comment: '', title: `Review Client: ${jobTitle}` });
  };

  const handlePostReview = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          job: reviewModal.jobId, 
          reviewee: reviewModal.revieweeId, 
          rating: reviewModal.rating, 
          comment: reviewModal.comment 
        })
      });
      if (res.ok) {
        setReviewModal({ shown: false, jobId: null, revieweeId: null, rating: 5, comment: '', title: '' });
        window.location.reload();
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

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

  const dashboardProps = {
    data, 
    formatDate,
    actionLoading,
    setSubmissionModal,
    handleAccept,
    handlePay,
    setReviewModal,
    setWorkViewModal,
    handleReviewClient
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
            
            <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
              <Link to="/settings" className="flex-1 sm:flex-none da-btn-outline flex items-center justify-center gap-2">
                <SettingsIcon className="w-4 h-4" /> SETTINGS
              </Link>
              {isClient ? (
                 <Link to="/jobs/new" className="flex-1 sm:flex-none da-btn-outline bg-daInfo-dark text-white text-center justify-center">POST A GIG</Link>
              ) : (
                 <Link to="/jobs" className="flex-1 sm:flex-none da-btn-outline text-center justify-center">BROWSE DOMAINS</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isClient ? (
          <ClientDashboardContent {...dashboardProps} />
        ) : (
          <FreelancerDashboardContent 
            profile={profile} 
            {...dashboardProps} 
          />
        )}
      </div>

      {/* SHARED SUBMIT MODAL */}
      {submissionModal.shown && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSubmissionModal({ shown: false, jobId: null, content: '' })} />
          <div className="relative bg-white w-full max-w-lg border-2 border-black da-shadow-black p-6 sm:p-8 animate-scale-in">
             <h3 className="text-2xl font-black text-daInfo-dark uppercase tracking-tight mb-2">Final Submission</h3>
             <p className="text-gray-500 text-sm mb-6 font-bold">Paste your links or final summary below for client review.</p>
             <textarea 
               rows="5" 
               value={submissionModal.content}
               onChange={(e) => setSubmissionModal(prev => ({ ...prev, content: e.target.value }))}
               placeholder="e.g. Here is the link to the GitHub Repo: https://github.com..."
               className="w-full p-4 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-daInfo-dark font-medium mb-6 resize-none"
             />
             <div className="flex gap-4">
               <button 
                 onClick={() => handleSubmitWork()}
                 disabled={actionLoading}
                 className="flex-1 py-4 bg-daInfo-dark text-white font-black uppercase tracking-widest hover:bg-black transition-colors"
               >
                 {actionLoading ? 'SUBMITTING...' : 'DEPLOY SUBMISSION'}
               </button>
               <button onClick={() => setSubmissionModal({ shown: false, jobId: null, content: '' })} className="px-6 py-4 border-2 border-gray-200 font-bold uppercase tracking-widest">CANCEL</button>
             </div>
          </div>
        </div>
      )}

      {/* SHARED REVIEW MODAL */}
      {reviewModal.shown && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setReviewModal({ shown: false, jobId: null, revieweeId: null, rating: 5, comment: '', title: '' })} />
          <div className="relative bg-white w-full max-w-lg border-2 border-black da-shadow-lg-pink p-8 animate-bounce-slow">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-daInfo-pink rounded-full flex items-center justify-center text-white border-2 border-black animate-spin-slow">
                  <Star className="w-8 h-8 fill-white" />
                </div>
             </div>
             <h3 className="text-2xl font-black text-center text-daInfo-dark uppercase tracking-tight mb-2">{reviewModal.title || 'Service Excellence'}</h3>
             <p className="text-gray-500 text-sm text-center mb-8 font-bold">Rate your experience.</p>
             
             <div className="flex justify-center gap-2 mb-8">
               {[1,2,3,4,5].map(s => (
                 <button key={s} onClick={() => setReviewModal(prev => ({ ...prev, rating: s }))} className="transition-transform hover:scale-125 focus:scale-125 outline-none">
                    <Star className={`w-8 h-8 ${s <= reviewModal.rating ? 'fill-daInfo-pink text-daInfo-pink' : 'text-gray-200'}`} />
                 </button>
               ))}
             </div>

             <textarea 
               rows="3" 
               value={reviewModal.comment}
               onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value }))}
               placeholder="Write a public review..."
               className="w-full p-4 border-2 border-gray-200 focus:border-daInfo-pink outline-none text-daInfo-dark font-medium mb-6 resize-none"
             />

             <button 
               onClick={() => handlePostReview()}
               disabled={actionLoading}
               className="w-full py-4 bg-daInfo-pink text-white font-black uppercase tracking-widest hover:bg-pink-600 transition-colors da-shadow-pink"
             >
               {actionLoading ? 'PUBLISHING...' : 'POST OFFICIAL REVIEW'}
             </button>
          </div>
        </div>
      )}
      {/* WORK VIEW MODAL */}
      {workViewModal.shown && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setWorkViewModal({ shown: false, content: '', title: '' })} />
          <div className="relative bg-white w-full max-w-2xl border-2 border-black da-shadow-black p-10 animate-scale-in text-left">
             <h3 className="text-3xl font-black text-daInfo-dark uppercase tracking-tighter mb-1">{workViewModal.title}</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Submission Inspection</p>
             
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap max-h-[50vh] overflow-y-auto mb-8">
                {workViewModal.content}
             </div>

             <button 
               onClick={() => setWorkViewModal({ shown: false, content: '', title: '' })}
               className="w-full py-4 border-2 border-black font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
             >
               DONE REVIEWING
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- CLIENT DASHBOARD -----
function ClientDashboardContent({ data, formatDate, actionLoading, handleAccept, handlePay, setWorkViewModal }) {
  const { postedJobs, clientStats } = data;
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [hiringId, setHiringId] = useState(null);
  const toast = useToast();

  const handleHire = async (jobId, freelancerId) => {
    // Hire confirmation is implicit — user clicked the Hire button
    
    setHiringId(freelancerId);
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch(`/api/jobs/${jobId}/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ freelancerId })
      });
      
      if (res.ok) {
        toast.success('Freelancer hired successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to hire freelancer.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setHiringId(null);
    }
  };

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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <button 
                             onClick={() => setWorkViewModal({ shown: true, content: job.submission?.content, title: job.title })}
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
                                {job.status === 'accepted' ? 'COMPLETION ACCEPTED' : '2. Accept Completion'}
                              </span>
                           </button>

                           <button 
                             onClick={() => handlePay(job._id, job.applicants?.[0]?.id)}
                             disabled={actionLoading}
                             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-daInfo-pink hover:bg-pink-50 transition-all group"
                           >
                              <DollarSign className="w-6 h-6 text-gray-300 group-hover:text-daInfo-pink mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-daInfo-pink">3. Pay Freelancer</span>
                           </button>
                        </div>

                        {job.status === 'accepted' && (
                          <div className="mt-6 flex items-center justify-center gap-3 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                             <Award className="w-4 h-4" /> Work accepted. Authorized for final payment.
                          </div>
                        )}

                        {job.status === 'needs-review' && (
                          <div className="mt-8 border-t border-gray-100 pt-8">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Shortcut Action</p>
                             <button 
                               onClick={() => handlePay(job._id, job.applicants?.[0]?.id)}
                               disabled={actionLoading}
                               className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-daInfo-dark transition-all da-shadow-black"
                             >
                               {actionLoading ? 'PROCESSING...' : 'QUICK APPROVE & PAY'}
                             </button>
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
                                        handleHire(job._id, app.id);
                                      }}
                                      disabled={hiringId === app.id}
                                      className="px-3 py-1 bg-daInfo-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                      {hiringId === app.id ? 'HIRING...' : 'HIRE'}
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

// ----- FREELANCER DASHBOARD -----
function FreelancerDashboardContent({ profile, data, formatDate, setSubmissionModal, setWorkViewModal, handleReviewClient }) {
  const { recruitmentHistory, earnings, rating, completedGigs } = data;
  const { skills, portfolio } = profile;

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
                 
                 <div>
                    <span className="md:hidden text-xs font-bold uppercase text-gray-400 mr-2">Status:</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${
                       historyItem.status === 'open' ? 'border-blue-200 text-blue-700 bg-blue-50' : 
                       historyItem.status === 'in-progress' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                       historyItem.status === 'accepted' ? 'border-blue-300 text-blue-800 bg-blue-50' :
                       historyItem.status === 'needs-review' ? 'border-daInfo-pink text-daInfo-pink bg-pink-50' : 
                       historyItem.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' : 
                       'border-gray-200 text-gray-600 bg-gray-50'
                     }`}>
                       {historyItem.status === 'accepted' ? 'AWAITING PAYMENT' : (historyItem.status || 'Applied')}
                    </span>
                 </div>
                 
                 <div className="text-right text-sm font-medium text-gray-500 flex items-center md:justify-end gap-1">
                    {historyItem.status === 'in-progress' && (
                       <button 
                         onClick={() => setSubmissionModal({ shown: true, jobId: historyItem._id, content: '' })}
                         className="mr-4 text-[10px] font-black text-daInfo-blue border-b-2 border-daInfo-blue hover:text-daInfo-dark hover:border-daInfo-dark transition-all"
                       >
                         SUBMIT GIG
                       </button>
                    )}
                    
                    {(historyItem.status === 'needs-review' || historyItem.status === 'accepted' || historyItem.status === 'completed') && (
                        <button 
                          onClick={() => setWorkViewModal({ shown: true, content: historyItem.submission?.content, title: historyItem.title })}
                          className="mr-4 text-[10px] font-black text-daInfo-pink border-b-2 border-daInfo-pink hover:text-daInfo-dark hover:border-daInfo-dark transition-all"
                        >
                          VIEW WORK
                        </button>
                     )}

                     {historyItem.status === 'completed' && (
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
            ))}
          </div>
        </div>
      )}
    </>
  );
}
