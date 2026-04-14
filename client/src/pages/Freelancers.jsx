import { useState, useEffect } from 'react';
import { Search, Star, Filter, Github, Linkedin, Globe, X, MapPin, Briefcase, CheckCircle } from 'lucide-react';
export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (selectedSkill) query.append('skill', selectedSkill);
        if (verifiedOnly) query.append('verified', 'true');
        query.append('page', page);
        query.append('limit', 12);
        
        const res = await fetch(`/api/users?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setFreelancers(data.freelancers || data);
          if (data.totalPages) {
             setTotalPages(data.totalPages);
          } else {
             setTotalPages(1);
          }
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchFreelancers, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedSkill, verifiedOnly, page]);

  const topSkills = ['Photography', 'Marketing', 'Accounting', 'React', 'Video Editing', 'Design', 'SEO', 'Data Analysis', 'Writing', 'Event Planning'];

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (selectedFreelancer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedFreelancer]);

  return (
    <div className="min-h-screen bg-white">
      <div className="da-grid-bg pt-32 pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-medium tracking-tight text-daInfo-dark mb-4">
            Our Elite Network
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl">
            Discover verified talent ready to tackle your next micro-gig.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, skill, or keyword..." 
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
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Filter by Skill</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedSkill('')} className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest ${!selectedSkill ? 'bg-daInfo-dark text-white border-daInfo-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>All</button>
                  {topSkills.map(s => (
                    <button key={s} onClick={() => setSelectedSkill(s === selectedSkill ? '' : s)} className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest ${s === selectedSkill ? 'bg-daInfo-dark text-white border-daInfo-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-3">Expertise Level</label>
                <label className={`cursor-pointer flex items-center gap-3 p-4 border-2 transition-all ${verifiedOnly ? 'border-daInfo-blue bg-daInfo-blue/5' : 'border-gray-200 hover:border-gray-300'}`}>
                   <input 
                     type="checkbox" 
                     checked={verifiedOnly} 
                     onChange={(e) => setVerifiedOnly(e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${verifiedOnly ? 'bg-daInfo-blue border-daInfo-blue' : 'border-gray-300'}`}>
                      {verifiedOnly && <div className="w-2 h-2 bg-white" />}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-daInfo-dark">Verified Specialists Only (4.2+ ★)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
           <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
             {loading ? 'Searching...' : `${freelancers.length} FREELANCER${freelancers.length !== 1 ? 'S' : ''} FOUND`}
           </p>
        </div>

        {/* Freelancers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 border border-gray-100 animate-pulse bg-gray-50" />
            ))
          ) : freelancers.map((user) => (
            <div 
              key={user._id} 
              onClick={() => setSelectedFreelancer(user)} 
            >
              {user.rating >= 4.2 && (
                <div className="absolute -top-3 -right-3 z-10 bg-daInfo-dark text-white p-2 border-2 border-white da-shadow-black">
                   <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                   </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-2 py-1">{user.rating >= 4.2 ? 'VERIFIED EXPERT' : 'CERTIFIED EXPERT'}</span>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 border border-yellow-200">
                   <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{user.rating} ({user.reviewCount})</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 border border-gray-200 object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-daInfo-dark leading-tight group-hover:text-daInfo-blue transition-colors truncate">{user.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 truncate">{user.skills[0]} Specialist</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow">{user.bio}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {user.skills.slice(0, 4).map(s => <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold">{s}</span>)}
                {user.skills.length > 4 && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold">+{user.skills.length - 4}</span>}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex flex-col text-left">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Gigs Done</p>
                   <span className="text-lg font-bold text-daInfo-dark">{user.completedGigs}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  {user.portfolio.github && <a href={user.portfolio.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-daInfo-dark transition-colors"><Github className="w-4 h-4" /></a>}
                  {user.portfolio.linkedin && <a href={user.portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-daInfo-dark transition-colors"><Linkedin className="w-4 h-4" /></a>}
                  {user.portfolio.website && <a href={user.portfolio.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-daInfo-dark transition-colors"><Globe className="w-4 h-4" /></a>}
                </div>
                <button className="text-xs font-bold text-daInfo-blue hover:text-daInfo-dark tracking-widest uppercase transition-colors">
                  HIRE NOW &rarr;
                </button>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-daInfo-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 border-2 border-gray-200 font-bold uppercase tracking-widest text-xs hover:border-black disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-2 border-2 border-gray-200 font-bold uppercase tracking-widest text-xs hover:border-black disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {!loading && freelancers.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-gray-200 mt-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-daInfo-dark mb-2">No freelancers found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* MODAL OVERLAY */}
        {selectedFreelancer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedFreelancer(null)} />
            <div className="relative bg-white w-full max-w-3xl border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-scale-in text-left">
              
              {/* Modal Header */}
              <div className="shrink-0 bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between z-10 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0">
                    <img src={selectedFreelancer.avatar} alt={selectedFreelancer.name} className="w-20 h-20 border border-gray-200 object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight">{selectedFreelancer.name}</h2>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mt-1">{selectedFreelancer.skills[0]} Specialist</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 border border-yellow-200">
                         <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                         <span className="text-xs font-bold uppercase tracking-widest">{selectedFreelancer.rating} ({selectedFreelancer.reviewCount} Reviews)</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1 border border-gray-200 px-2 py-0.5 bg-gray-50">
                        <MapPin className="w-3 h-3" /> {selectedFreelancer.location || "Remote"}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedFreelancer(null)} className="absolute top-4 right-4 md:static p-2 border border-transparent hover:border-gray-200 text-gray-400 hover:text-daInfo-dark hover:bg-gray-50 transition-all bg-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="grid md:grid-cols-3 gap-8 text-left">
                  {/* Left Column (Main Info) */}
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Biography</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedFreelancer.bio}</p>
                      <p className="text-gray-600 leading-relaxed mt-4">
                        Committed to building scalable, high-performance solutions. I prioritize transparent communication and rapid delivery execution, ensuring every micro-gig exceeds baseline requirements correctly on the first attempt.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Technical Arsenal</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFreelancer.skills.map(s => (
                          <span key={s} className="px-3 py-1.5 border border-gray-200 bg-gray-50 text-daInfo-dark text-xs font-bold uppercase tracking-widest">{s}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column (Stats & CTA) */}
                  <div className="space-y-6">
                    <div className="border border-gray-200 bg-gray-50 flex flex-col">
                      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hourly Rate</p>
                        <span className="text-xl font-bold text-daInfo-dark">${selectedFreelancer.hourlyRate}/hr</span>
                      </div>
                      <div className="p-5 flex items-center justify-between bg-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gigs Done</p>
                        <div className="flex items-center gap-1">
                           <span className="text-xl font-bold text-daInfo-dark">{selectedFreelancer.completedGigs}</span>
                           <Briefcase className="w-4 h-4 text-gray-300 ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                       <button className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white uppercase tracking-widest bg-daInfo-dark hover:bg-black transition-all group">
                          HIRE {selectedFreelancer.name.split(' ')[0]} NOW
                          <span className="w-2 h-2 bg-daInfo-blue absolute right-4 group-hover:bg-white transition-colors" />
                       </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                      {selectedFreelancer.portfolio.github && <a href={selectedFreelancer.portfolio.github} target="_blank" rel="noopener noreferrer" className="p-3 border border-gray-200 bg-white text-gray-400 hover:text-daInfo-dark hover:border-gray-400 transition-all shadow-sm"><Github className="w-4 h-4" /></a>}
                      {selectedFreelancer.portfolio.linkedin && <a href={selectedFreelancer.portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 border border-gray-200 bg-white text-gray-400 hover:text-daInfo-dark hover:border-gray-400 transition-all shadow-sm"><Linkedin className="w-4 h-4" /></a>}
                      {selectedFreelancer.portfolio.website && <a href={selectedFreelancer.portfolio.website} target="_blank" rel="noopener noreferrer" className="p-3 border border-gray-200 bg-white text-gray-400 hover:text-daInfo-dark hover:border-gray-400 transition-all shadow-sm"><Globe className="w-4 h-4" /></a>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
