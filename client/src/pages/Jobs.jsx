import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, Zap, X, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

// Cache Buster: v1.0.1 - Fixed ReferenceError
export default function Jobs() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModal, setApplyModal] = useState({ shown: false, message: '', experience: '', contactInfo: '', attachment: null });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyStatus, setApplyStatus] = useState(null);



  const categories = [
    'Technology & IT', 'Creative & Design', 'Writing & Translation',
    'Marketing & Sales', 'Business & Operations', 'Lifestyle & Health',
    'Photography & Media', 'Events & Hospitality', 'Other Services'
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (selectedCategory) query.append('category', selectedCategory);
        if (sortBy === 'urgent') query.append('sort', 'urgent');
        if (sortBy === 'budget') query.append('sort', 'budget');
        if (minBudget) query.append('minBudget', minBudget);
        if (maxBudget) query.append('maxBudget', maxBudget);
        if (selectedDuration) query.append('duration', selectedDuration);
        
        const res = await fetch(`/api/jobs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // If client, filter to show only their own jobs (if needed, or handled by backend)
          let filteredData = data;
          if (authUser?.role === 'client') {
            filteredData = data.filter(job => {
               const posterId = typeof job.poster === 'object' ? job.poster._id : job.poster;
               return posterId === authUser._id;
            });
          }
          setJobsData(filteredData);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sortBy, authUser, minBudget, maxBudget, selectedDuration]);

  const filtered = jobsData; // Already filtered/sorted by backend/effect

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedJob]);

  return (
    <div className="min-h-screen bg-white">
      <div className="da-grid-bg pt-32 pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-medium tracking-tight text-daInfo-dark mb-4">
            Browse Domains
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl">
            Find the perfect micro-task that matches your expertise.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" 
                placeholder="Search by title, skill, or keyword..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-daInfo-dark outline-none bg-white text-daInfo-dark transition-colors font-medium"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`da-btn-outline ${showFilters ? 'bg-gray-50' : ''}`}
            >
              <Filter className="w-5 h-5" />
              FILTERS
            </button>
          </div>

          {showFilters && (
            <div className="border-2 border-daInfo-dark bg-white p-6 space-y-6 mt-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Domain Focus</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest ${!selectedCategory ? 'bg-daInfo-dark text-white border-daInfo-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>All</button>
                  {categories.map(c => (
                    <button key={c} onClick={() => setSelectedCategory(c === selectedCategory ? '' : c)} className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest ${c === selectedCategory ? 'bg-daInfo-dark text-white border-daInfo-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Sort Priority</label>
                <div className="flex gap-2">
                  {[['newest', 'Newest'], ['budget', 'Highest Budget'], ['urgent', 'Urgent First']].map(([val, label]) => (
                    <button key={val} onClick={() => setSortBy(val)} className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest ${sortBy === val ? 'bg-daInfo-dark text-white border-daInfo-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Budget Range ($)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minBudget} 
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full p-2 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-xs font-bold"
                    />
                    <span className="text-gray-400">—</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxBudget} 
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full p-2 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Est. Duration</label>
                  <select 
                    value={selectedDuration} 
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-xs font-bold uppercase tracking-widest h-[42px]"
                  >
                    <option value="">Any Duration</option>
                    <option value="Day">Under 24 Hours</option>
                    <option value="3 Days">1-3 Days</option>
                    <option value="Week">1 Week+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
           <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
             {filtered.length} AVAILABLE GIG{filtered.length !== 1 ? 'S' : ''}
           </p>
        </div>

        {/* Job Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((job) => (
            <div 
              key={job._id} 
              onClick={() => setSelectedJob(job)}
              className="border border-gray-200 hover:border-black transition-all p-6 flex flex-col group cursor-pointer bg-white relative da-shadow-black-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{job.category}</span>
                <div className="flex gap-2">
                  {job.isUrgent && <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-1 border border-red-200 px-2 py-1"><Clock className="w-3 h-3" />Urgent</span>}
                  {job.isInstantHire && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1 border border-blue-200 px-2 py-1"><Zap className="w-3 h-3" />Instant</span>}
                </div>
              </div>

              <h3 className="text-xl font-bold text-daInfo-dark mb-4 leading-tight group-hover:text-daInfo-blue transition-colors line-clamp-2">{job.title}</h3>

              <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow">{job.description.split('\n')[0]}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.map(s => <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold">{s}</span>)}
              </div>

              {/* Bottom Info & Action */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex gap-6">
                  <div className="flex flex-col text-left">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pay</p>
                     <span className="text-sm font-bold text-daInfo-dark">${job.budget.min}–${job.budget.max}</span>
                  </div>
                  <div className="flex flex-col text-left">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Time</p>
                     <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{job.duration}</span>
                  </div>
                </div>

                 <div className="pt-0">
                    {authUser?.role === 'client' || (authUser && job.poster?._id === authUser._id) ? (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedJob(job);
                         }}
                         className="px-4 py-2 border-2 border-daInfo-dark text-daInfo-dark text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all font-bold"
                       >
                          VIEW GIG
                       </button>
                    ) : (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedJob(job);
                           setApplyModal({ shown: true, message: '', experience: '', contactInfo: '' });
                         }}
                         className="px-4 py-2 bg-daInfo-dark text-white text-[10px] font-black uppercase tracking-[0.2em] da-shadow-black hover:bg-black transition-all"
                       >
                          APPLY NOW
                       </button>
                    )}
                 </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <img src={job.poster.avatar} alt="" className="w-8 h-8 object-cover border border-gray-200" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-daInfo-dark leading-none">{job.poster.name}</span>
                  <span className="block text-[10px] font-bold text-gray-500 mt-1">★ {job.poster.rating}</span>
                </div>
              </div>

              {/* Hover effect bottom bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-daInfo-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-daInfo-dark mb-2">No matching gigs</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
        
        {/* MODAL OVERLAY */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
            <div className="relative bg-white w-full max-w-4xl border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] max-h-[90vh] flex flex-col animate-scale-in text-left">
              
              {/* Modal Header */}
              <div className="shrink-0 bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between z-10 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 border border-gray-200">{selectedJob.category}</span>
                     {selectedJob.isUrgent && <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-1 border border-red-200 px-2 py-1"><Clock className="w-3 h-3" />Urgent</span>}
                     {selectedJob.isInstantHire && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1 border border-blue-200 px-2 py-1"><Zap className="w-3 h-3" />Instant Hire</span>}
                  </div>
                  <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight leading-tight">{selectedJob.title}</h2>
                </div>
                <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 md:static p-2 border border-transparent hover:border-gray-200 text-gray-400 hover:text-daInfo-dark hover:bg-gray-50 transition-all bg-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column (Main Info) */}
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Job Description</h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedJob.description}
                      </div>
                    </section>

                    <section className="bg-gray-50 border border-gray-200 p-6">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-daInfo-dark mb-4">Core Responsibilities</h3>
                       <ul className="space-y-3 list-disc list-inside text-gray-600 font-medium">
                         <li>Execute deliverables within the agreed scope and timeline.</li>
                         <li>Maintain clear, active communication with the client.</li>
                         <li>Ensure output meets the specified quality benchmarks.</li>
                         <li>Deliver all associated source files upon completion.</li>
                       </ul>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map(s => (
                          <span key={s} className="px-3 py-1.5 border border-gray-200 bg-white text-daInfo-dark text-xs font-bold uppercase tracking-widest">{s}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column (Stats & CTA) */}
                  <div className="space-y-6">
                    <div className="border border-gray-200 bg-gray-50 flex flex-col">
                      <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Expected Pay</p>
                        <span className="text-xl font-bold text-green-600">${selectedJob.budget.min} - ${selectedJob.budget.max}</span>
                      </div>
                      <div className="p-5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Est. Duration</p>
                        <div className="flex items-center gap-1 text-daInfo-dark font-bold">
                           <Clock className="w-4 h-4 text-gray-400" />
                           <span>{selectedJob.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 bg-white p-5 flex items-center gap-4">
                      <img src={selectedJob.poster.avatar} alt="Client Avatar" className="w-12 h-12 border border-gray-200 object-cover" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Posted By Client</span>
                        <h4 className="text-sm font-bold text-daInfo-dark leading-none">{selectedJob.poster.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-gray-500">
                          <span className="text-[10px] font-bold">★ {selectedJob.poster.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                       {authUser?.role === 'client' || (authUser && selectedJob.poster?._id === authUser._id) ? (
                          <button 
                            onClick={() => {
                              if (selectedJob.poster?._id === authUser?._id) {
                                navigate('/dashboard');
                              } else {
                                toast.warning('Employer accounts cannot apply for gigs.');
                              }
                            }} 
                            className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-5 text-sm font-bold text-white uppercase tracking-widest bg-daInfo-dark hover:bg-black transition-all group shadow-sm"
                          >
                             {selectedJob.poster?._id === authUser?._id ? 'MANAGE THIS GIG' : 'CLIENT ACCOUNT'}
                             <span className="w-2 h-2 bg-daInfo-blue absolute right-5 group-hover:bg-white transition-colors" />
                          </button>
                       ) : (
                          <button 
                            onClick={() => setApplyModal({ shown: true, message: '' })}
                            className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-5 text-sm font-bold text-white uppercase tracking-widest bg-daInfo-dark hover:bg-black transition-all group shadow-sm"
                          >
                             APPLY TO GIG
                             <span className="w-2 h-2 bg-daInfo-blue absolute right-5 group-hover:bg-white transition-colors" />
                          </button>
                       )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLY MODAL */}
        {applyModal.shown && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setApplyModal({ shown: false, message: '', experience: '', contactInfo: '', attachment: null })} />
            <div className="relative bg-white w-full max-w-xl border-2 border-black da-shadow-lg-black p-8 animate-scale-in text-left">
               <h3 className="text-2xl font-black text-daInfo-dark uppercase tracking-tight mb-2">Gig Application Card</h3>
               <p className="text-gray-500 text-sm mb-8 font-bold italic">This information will be sent directly to the employer's dashboard.</p>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-daInfo-dark block mb-2">Relevant Experience</label>
                    <input 
                      type="text"
                      value={applyModal.experience}
                      onChange={(e) => setApplyModal(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. 3 years in MERN stack development..."
                      className="w-full p-4 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-daInfo-dark font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-daInfo-dark block mb-2">Cover Letter / Pitch</label>
                    <textarea 
                      rows="4" 
                      value={applyModal.message}
                      onChange={(e) => setApplyModal(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Why should we hire you? Highlight your unique approach..."
                      className="w-full p-4 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-daInfo-dark font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-daInfo-dark block mb-2">Direct Contact Information</label>
                    <input 
                      type="text"
                      value={applyModal.contactInfo}
                      onChange={(e) => setApplyModal(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Email or Phone Number..."
                      className="w-full p-4 border-2 border-gray-200 focus:border-daInfo-dark outline-none text-daInfo-dark font-medium"
                    />
                  </div>
                  
                      <label className="text-xs font-black uppercase tracking-widest text-daInfo-dark block mb-2">Resume / Portfolio (PDF)</label>
                      <input 
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setApplyModal(prev => ({ ...prev, attachment: e.target.files[0] }))}
                        className="w-full text-sm font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-white file:text-black file:font-bold file:uppercase file:tracking-widest hover:file:bg-black hover:file:text-white transition-all cursor-pointer border-2 border-gray-200 p-2 focus:border-daInfo-dark"
                      />
                    </div>
                  
                  {applyStatus && (
                    <div className={`p-3 text-xs font-bold uppercase tracking-widest ${applyStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {applyStatus.msg}
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={async () => {
                        setApplyLoading(true);
                        setApplyStatus(null);
                        try {
                          const token = localStorage.getItem('microgig_token');
                          const formData = new FormData();
                          formData.append('message', applyModal.message);
                          formData.append('experience', applyModal.experience);
                          formData.append('contactInfo', applyModal.contactInfo);
                          if (applyModal.attachment) {
                            formData.append('attachment', applyModal.attachment);
                          }

                          const res = await fetch(`/api/jobs/${selectedJob._id}/apply`, {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${token}`
                            },
                            body: formData
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setApplyStatus({ type: 'success', msg: 'Application Deployed!' });
                            setTimeout(() => {
                              setApplyModal({ shown: false, message: '', experience: '', contactInfo: '', attachment: null });
                              setApplyStatus(null);
                              setSelectedJob(null); // Close main modal too
                            }, 1500);
                          } else {
                            setApplyStatus({ type: 'error', msg: data.message || 'Error applying' });
                          }
                        } catch (err) {
                          setApplyStatus({ type: 'error', msg: 'Network error' });
                        } finally {
                          setApplyLoading(false);
                        }
                      }}
                      disabled={applyLoading}
                      className="flex-1 px-6 py-4 bg-daInfo-dark text-white font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {applyLoading ? 'SENDING...' : 'COMMIT APPLICATION'}
                    </button>
                    <button 
                      onClick={() => setApplyModal({ shown: false, message: '', experience: '', contactInfo: '' })}
                      className="px-6 py-4 border-2 border-gray-200 font-bold uppercase tracking-widest hover:border-black transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
