import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, AlertCircle, Clock, Zap } from 'lucide-react';
import { categories } from '../data/mockData';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    skills: '',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    isUrgent: false,
    isInstantHire: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('microgig_token');
      if (!token) {
        throw new Error('You must be logged in to post a gig.');
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        budget: {
          min: Number(formData.budgetMin),
          max: Number(formData.budgetMax)
        },
        duration: formData.duration,
        isUrgent: formData.isUrgent,
        isInstantHire: formData.isInstantHire
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to post gig.');
      }

      navigate('/dashboard'); // Go back to employer dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-daInfo-dark transition-colors mb-4 inline-block">
             ← BACK TO DASHBOARD
          </Link>
          <h1 className="text-4xl font-bold text-daInfo-dark tracking-tight leading-none mb-2">DEPLOY A NEW GIG</h1>
          <p className="text-gray-500 text-lg">Define the scope, set the budget, and source top talent instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] p-8 sm:p-12 space-y-8">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Core Info */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">Core Parameters</h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Project Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Build a REST API with Express" className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-medium text-daInfo-dark" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Domain</label>
                <select name="category" required value={formData.category} onChange={handleChange} className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-bold text-sm uppercase tracking-widest text-daInfo-dark cursor-pointer appearance-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Required Skills</label>
                <input type="text" name="skills" required value={formData.skills} onChange={handleChange} placeholder="React, Node, Express (comma separated)" className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-medium text-daInfo-dark" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Detailed Scope & Requirements</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="5" placeholder="Describe the problem, the deliverables, and any specific constraints..." className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-medium text-daInfo-dark resize-none" />
            </div>
          </section>

          {/* Logistics */}
          <section className="space-y-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">Logistics & Compensation</h3>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Min Budget ($)</label>
                <input type="number" name="budgetMin" required min="1" value={formData.budgetMin} onChange={handleChange} placeholder="50" className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-bold text-daInfo-dark" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Max Budget ($)</label>
                <input type="number" name="budgetMax" required min="1" value={formData.budgetMax} onChange={handleChange} placeholder="150" className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-bold text-daInfo-dark" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-daInfo-dark uppercase tracking-widest">Expected Duration</label>
                <input type="text" name="duration" required value={formData.duration} onChange={handleChange} placeholder="e.g. 2 Days, 3 Hours" className="w-full p-4 border border-gray-200 bg-gray-50 focus:bg-white focus:border-daInfo-dark outline-none font-medium text-daInfo-dark" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <label className={`cursor-pointer flex items-center gap-4 p-4 border-2 transition-all group ${formData.isUrgent ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 flex-shrink-0 border-2 rounded-sm flex items-center justify-center transition-colors ${formData.isUrgent ? 'border-red-500 bg-red-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {formData.isUrgent && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Clock className={`w-4 h-4 ${formData.isUrgent ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${formData.isUrgent ? 'text-red-700' : 'text-gray-500'}`}>Mark as Urgent</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Pushes gig to the top of the queue.</p>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center gap-4 p-4 border-2 transition-all group ${formData.isInstantHire ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" name="isInstantHire" checked={formData.isInstantHire} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 flex-shrink-0 border-2 rounded-sm flex items-center justify-center transition-colors ${formData.isInstantHire ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {formData.isInstantHire && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Zap className={`w-4 h-4 ${formData.isInstantHire ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${formData.isInstantHire ? 'text-blue-700' : 'text-gray-500'}`}>Instant Hire</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Allows freelancers to auto-accept.</p>
                </div>
              </label>
            </div>
          </section>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full p-6 bg-daInfo-dark hover:bg-black text-white font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3">
               <Briefcase className="w-5 h-5" />
               {loading ? 'DEPLOYING...' : 'FINAL POST'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
