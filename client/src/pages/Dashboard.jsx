import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Activity, CheckCircle, Target, 
  Settings as SettingsIcon, Award, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import GuildLeaderboard from '../components/dashboard/GuildLeaderboard';
import api from '../lib/api';

import ClientDashboardContent from '../components/dashboard/ClientDashboardContent';
import FreelancerDashboardContent from '../components/dashboard/FreelancerDashboardContent';
import SubmissionModal from '../components/modals/SubmissionModal';
import ReviewModal from '../components/modals/ReviewModal';
import WorkViewModal from '../components/modals/WorkViewModal';
import PaymentModal from '../components/modals/PaymentModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState({ shown: false, jobId: null, content: '' });
  const [reviewModal, setReviewModal] = useState({ shown: false, jobId: null, revieweeId: null, rating: 5, comment: '', title: '' });
  const [workViewModal, setWorkViewModal] = useState({ shown: false, submission: null, title: '' });
  const [paymentModal, setPaymentModal] = useState({ shown: false, jobId: null, freelancerId: null, title: '' });
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
        const { data: json } = await api.get('/users/me/dashboard');
        setData(json);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
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
      await api.post(`/jobs/${submissionModal.jobId}/submit`, { content: submissionModal.content });
      setSubmissionModal({ shown: false, jobId: null, content: '' });
      window.location.reload();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to submit work.');
      console.error(err); 
    }
    finally { setActionLoading(false); }
  };

  const handleAccept = async (jobId) => {
    setActionLoading(true);
    try {
      await api.post(`/jobs/${jobId}/accept`);
      window.location.reload();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to accept work.');
      console.error(err); 
    }
    finally { setActionLoading(false); }
  };

  const handlePay = (jobId, freelancerId, title) => {
    setPaymentModal({ shown: true, jobId, freelancerId, title });
  };

  const executePayment = async () => {
    setActionLoading(true);
    const { jobId } = paymentModal;
    try {
      // 1. Load Razorpay script
      const resScript = await loadRazorpay();
      if (!resScript) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setActionLoading(false);
        return;
      }

      // 2. Create Order on Backend
      const { data: orderData } = await api.post('/payments/order', { jobId, freelancerId: paymentModal.freelancerId });

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
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId,
                freelancerId: paymentModal.freelancerId
              });
            toast.success('Payment successful and verified!');
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
           color: '#FF1493'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) { 
      console.error(err); 
      toast.error(`Payment Error: ${err.response?.data?.message || err.message}`);
    }
    finally { 
      setActionLoading(false); 
      setPaymentModal({ shown: false, jobId: null, freelancerId: null, title: '' });
    }
  };

  const handleReviewClient = (jobId, clientId, jobTitle) => {
    setReviewModal({ shown: true, jobId, revieweeId: clientId, rating: 5, comment: '', title: `Review Client: ${jobTitle}` });
  };

  const handlePostReview = async () => {
    setActionLoading(true);
    try {
      await api.post('/reviews', { 
        job: reviewModal.jobId, 
        reviewee: reviewModal.revieweeId, 
        rating: reviewModal.rating, 
        comment: reviewModal.comment 
      });
      setReviewModal({ shown: false, jobId: null, revieweeId: null, rating: 5, comment: '', title: '' });
      window.location.reload();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to post review.');
      console.error(err); 
    }
    finally { setActionLoading(false); }
  };

  if (!user) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {isClient ? (
              <ClientDashboardContent {...dashboardProps} />
            ) : (
              <FreelancerDashboardContent 
                profile={profile} 
                {...dashboardProps} 
              />
            )}
          </div>
          
          <aside className="space-y-12">
            <GuildLeaderboard />
            
            {/* TRIBAL STATUS CARD */}
            <div className="border-4 border-black p-8 bg-daInfo-dark text-white da-shadow-black relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Target className="w-32 h-32" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6">Your_Tribal_Rank</h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                     <span className="text-4xl font-black tracking-tighter">#{profile.completedGigs > 10 ? 'TOP_TIER' : 'RECRUIT'}</span>
                     <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="h-2 bg-white/20 border border-white/10">
                     <div className="h-full bg-yellow-400" style={{ width: `${Math.min((profile.completedGigs || 0) * 10, 100)}%` }} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                     {profile.guild ? `PROUD_MEMBER_OF: ${profile.guild}` : 'NO_GUILD_DETECTED. JOIN_IN_SETTINGS.'}
                  </p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      <SubmissionModal 
        shown={submissionModal.shown} 
        jobId={submissionModal.jobId} 
        content={submissionModal.content} 
        setSubmissionModal={setSubmissionModal} 
        actionLoading={actionLoading} 
        handleSubmitWork={handleSubmitWork} 
      />
      <ReviewModal 
        reviewModal={reviewModal} 
        setReviewModal={setReviewModal} 
        actionLoading={actionLoading} 
        handlePostReview={handlePostReview} 
      />
      <WorkViewModal 
        workViewModal={workViewModal} 
        setWorkViewModal={setWorkViewModal} 
      />
      <PaymentModal 
        paymentModal={paymentModal} 
        setPaymentModal={setPaymentModal} 
        actionLoading={actionLoading} 
        executePayment={executePayment} 
      />
    </div>
  );
}
