import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building, Settings as SettingsIcon, CreditCard, ShieldCheck, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ClientSettings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    clientProfile: {
      companyName: '',
      companyLogoUrl: '',
      industry: '',
      companySize: '',
      companyWebsite: '',
      aboutCompany: '',
      hiringIndustries: '',
      timezone: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        clientProfile: {
          companyName: user.clientProfile?.companyName || '',
          companyLogoUrl: user.clientProfile?.companyLogoUrl || '',
          industry: user.clientProfile?.industry || '',
          companySize: user.clientProfile?.companySize || '',
          companyWebsite: user.clientProfile?.companyWebsite || '',
          aboutCompany: user.clientProfile?.aboutCompany || '',
          hiringIndustries: user.clientProfile?.hiringIndustries ? user.clientProfile.hiringIndustries.join(', ') : '',
          timezone: user.clientProfile?.timezone || ''
        }
      });
      fetchClientStats();
    }
  }, [user]);

  const fetchClientStats = async () => {
    try {
      const res = await fetch(`/api/users/client/stats/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch client stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData(p => ({ ...p, name: value }));
    } else {
      setFormData(p => ({
        ...p,
        clientProfile: { ...p.clientProfile, [name]: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          clientProfile: {
            ...formData.clientProfile,
            hiringIndustries: formData.clientProfile.hiringIndustries.split(',').map(s => s.trim()).filter(Boolean)
          }
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setStatus({ type: 'error', msg: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      <div className="da-grid-bg pt-32 pb-16 border-b border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-1 bg-daInfo-dark" />
             <span className="text-xs font-black uppercase tracking-[0.3em] text-daInfo-dark">CLIENT CONTROL</span>
          </div>
          <h1 className="text-5xl font-black text-daInfo-dark tracking-tighter uppercase leading-none">
            Employer Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {status && (
            <div className={`p-6 border-4 flex items-center gap-4 animate-scale-in ${status.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
               {status.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
               <p className="font-black uppercase tracking-widest text-sm">{status.msg}</p>
            </div>
          )}

          {/* Trust & Stats (Read-Only) */}
          <section className="bg-gray-50 border-2 border-gray-100 p-8">
             <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-200">
               <ShieldCheck className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Trust & Stats</h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                   <p className="text-xl font-black text-daInfo-dark mt-1 flex items-center gap-2">
                     {user.clientProfile?.isVerifiedBusiness ? <><CheckCircle className="w-4 h-4 text-emerald-500"/> Verified</> : 'Unverified'}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Jobs Posted</p>
                   <p className="text-xl font-black text-daInfo-dark mt-1">{stats?.totalJobsPosted || 0}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jobs Filled</p>
                   <p className="text-xl font-black text-daInfo-dark mt-1">{stats?.jobsFilled || 0}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hire Rate</p>
                   <p className="text-xl font-black text-daInfo-dark mt-1">{stats?.hireRate || 0}%</p>
                </div>
             </div>
          </section>

          {/* Core Identity */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <User className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Core Identity</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Email (Read-only)</label>
                <input 
                  type="text" 
                  value={user.email}
                  disabled
                  className="w-full p-4 border-2 border-gray-100 bg-gray-50 text-gray-400 font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Company Info */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <Building className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Company Info</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.clientProfile.companyName}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Industry</label>
                <input 
                  type="text" 
                  name="industry"
                  value={formData.clientProfile.industry}
                  onChange={handleChange}
                  placeholder="e.g. Fintech, Healthcare, E-commerce"
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Size</label>
                <select
                  name="companySize"
                  value={formData.clientProfile.companySize}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all appearance-none bg-white"
                >
                  <option value="">Select Size...</option>
                  <option value="solo">Solo / Individual</option>
                  <option value="2-10">2-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="200+">200+ Employees</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Website</label>
                <input 
                  type="text" 
                  name="companyWebsite"
                  value={formData.clientProfile.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://company.com"
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">About the Company</label>
              <textarea 
                rows="4"
                name="aboutCompany"
                value={formData.clientProfile.aboutCompany}
                onChange={handleChange}
                placeholder="What does your company do? What is your mission?"
                className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all resize-none"
              />
            </div>
          </section>

          {/* Hiring Preferences */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <SettingsIcon className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Hiring Preferences</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hiring Industries (Comma Separated)</label>
              <input 
                type="text" 
                name="hiringIndustries"
                value={formData.clientProfile.hiringIndustries}
                onChange={handleChange}
                placeholder="Design, Engineering, Copywriting..."
                className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 italic">Helps freelancers find your jobs faster.</p>
            </div>
          </section>

          <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-12 py-6 bg-daInfo-dark text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all da-shadow-black active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5" />
              {loading ? 'SYNCING...' : 'COMMIT CHANGES'}
            </button>
            <Link to="/dashboard" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-daInfo-dark transition-colors">
              ABORT AND RETURN
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
