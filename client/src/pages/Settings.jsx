import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Globe, Github, Linkedin, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    website: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        github: user.portfolio?.github || '',
        linkedin: user.portfolio?.linkedin || '',
        website: user.portfolio?.website || ''
      });
    }
  }, [user]);

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
          bio: formData.bio,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          portfolio: {
            github: formData.github,
            linkedin: formData.linkedin,
            website: formData.website
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
             <span className="text-xs font-black uppercase tracking-[0.3em] text-daInfo-dark">IDENTITY CONTROL</span>
          </div>
          <h1 className="text-5xl font-black text-daInfo-dark tracking-tighter uppercase leading-none">
            User Settings
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

          {/* Core Profile */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <User className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Core Identity</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address (Read-only)</label>
                <input 
                  type="text" 
                  value={user.email}
                  disabled
                  className="w-full p-4 border-2 border-gray-100 bg-gray-50 text-gray-400 font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Professional Bio</label>
              <textarea 
                rows="4"
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about your expertise..."
                className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all resize-none"
              />
            </div>
          </section>

          {/* Logistics / Skills */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <Briefcase className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Professional Specs</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mastered Skills (Comma Separated)</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData(p => ({ ...p, skills: e.target.value }))}
                placeholder="React, Node.js, Python, UI Design..."
                className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 italic">These keywords determine your visibility in searches.</p>
            </div>
          </section>

          {/* Online Presence */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-gray-100 pb-2">
               <Globe className="w-5 h-5 text-daInfo-dark" />
               <h2 className="text-xl font-black text-daInfo-dark uppercase tracking-tight">Digital Footprint</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Github className="w-3 h-3" /> GitHub
                </label>
                <input 
                  type="text" 
                  value={formData.github}
                  onChange={(e) => setFormData(p => ({ ...p, github: e.target.value }))}
                  placeholder="github.com/yourusername"
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </label>
                <input 
                  type="text" 
                  value={formData.linkedin}
                  onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/username"
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Globe className="w-3 h-3" /> Portfolio Website
                </label>
                <input 
                  type="text" 
                  value={formData.website}
                  onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  placeholder="yourlink.com"
                  className="w-full p-4 border-2 border-black focus:bg-daInfo-blue/5 focus:border-daInfo-blue outline-none font-bold text-daInfo-dark transition-all"
                />
              </div>
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
