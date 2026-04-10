import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

// Custom Animated Freelancer SVG Scene
const FreelancerAnimation = () => {
  return (
    <div className="w-full h-full bg-[#f4b41a] flex items-center justify-center relative overflow-hidden">
      <svg viewBox="0 0 800 600" className="w-full h-full min-w-[400px] transform scale-100 sm:scale-95">
        {/* Floor shadow */}
        <ellipse cx="400" cy="550" rx="200" ry="15" fill="rgba(0,0,0,0.1)" />

        {/* Desk */}
        <rect x="180" y="400" width="460" height="15" rx="5" fill="#3e2723" />
        {/* Legs */}
        <path d="M 220 415 L 200 550 M 270 415 L 290 550 M 600 415 L 620 550 M 550 415 L 530 550" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" />

        {/* Chair Base */}
        <rect x="390" y="450" width="20" height="70" fill="#2c3e50" />
        <path d="M 400 520 L 350 540 M 400 520 L 450 540" stroke="#2c3e50" strokeWidth="10" strokeLinecap="round" />
        {/* Wheels */}
        <circle cx="350" cy="545" r="8" fill="#1a252f" />
        <circle cx="450" cy="545" r="8" fill="#1a252f" />
        {/* Chair Seat */}
        <rect x="340" y="440" width="120" height="15" rx="7" fill="#34495e" />
        
        {/* Person Legs */}
        <path d="M 370 440 L 370 510 L 340 510" stroke="#0e1726" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 410 440 L 410 510 L 450 510" stroke="#152238" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Shoes */}
        <rect x="310" y="495" width="40" height="15" rx="5" fill="#e74c3c" />
        <rect x="425" y="495" width="40" height="15" rx="5" fill="#e74c3c" />
        
        {/* Torso */}
        <rect x="360" y="270" width="70" height="180" rx="30" fill="#152238" />

        {/* Monitor */}
        <path d="M 500 340 L 520 400 L 480 400 Z" fill="#95a5a6" />
        <rect x="460" y="395" width="80" height="5" rx="2" fill="#7f8c8d" />
        <rect x="420" y="190" width="180" height="130" rx="10" fill="#ecf0f1" />
        <rect x="430" y="200" width="160" height="100" rx="5" fill="#2c3e50" />

        {/* Animated Code Lines */}
        <g opacity="0.9">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.rect
              key={`line1-${i}`} x="440" y={215 + i*14} height="6" rx="3" fill={i % 2 === 0 ? "#3498db" : "#2ecc71"}
              animate={{ width: [30 + i*10, 80 - i*5, 30 + i*10] }}
              transition={{ duration: 2 + i*0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <motion.rect
              key={`line2-${i}`} x="440" y={222 + i*14} height="6" rx="3" fill="#ecf0f1"
              animate={{ width: [20 + i*5, 50 + i*8, 20 + i*5] }}
              transition={{ duration: 1.5 + i*0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </g>

        {/* Laptop Workspace */}
        <polygon points="310,400 370,350 420,350 360,400" fill="#bdc3c7" />
        <polygon points="300,410 310,400 360,400 350,410" fill="#95a5a6" />
        <polygon points="360,290 415,290 395,350 340,350" fill="#ecf0f1" />
        <polygon points="365,295 405,295 390,340 350,340" fill="#34495e" />

        {/* Person Head & Animation */}
        <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "395px 260px" }}>
          <rect x="382" y="250" width="26" height="30" fill="#f39c12" />
          <circle cx="395" cy="220" r="35" fill="#f1c40f" />
          <path d="M 360 220 C 360 170 430 170 430 220 L 430 190 C 430 160 360 160 360 190 Z" fill="#2c3e50" />
          <rect x="390" y="210" width="16" height="10" rx="3" fill="none" stroke="#2c3e50" strokeWidth="3" />
          <rect x="415" y="210" width="16" height="10" rx="3" fill="none" stroke="#2c3e50" strokeWidth="3" />
          <line x1="406" y1="215" x2="415" y2="215" stroke="#2c3e50" strokeWidth="3" />
          <path d="M 380 230 C 370 250 370 280 380 300" stroke="#ecf0f1" strokeWidth="2" fill="none" />
        </motion.g>

        {/* Animated Arms / Hands */}
        <motion.path
          d="M 380 280 Q 340 340 330 360" stroke="#152238" strokeWidth="22" strokeLinecap="round" fill="none"
          animate={{ d: ["M 380 280 Q 340 340 330 360", "M 380 280 Q 345 330 335 370"] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.path
          d="M 400 280 Q 380 340 360 360" stroke="#0e1726" strokeWidth="22" strokeLinecap="round" fill="none"
          animate={{ d: ["M 400 280 Q 380 340 360 360", "M 400 280 Q 385 335 370 365"] }}
          transition={{ duration: 0.25, repeat: Infinity, repeatType: "mirror", delay: 0.1 }}
        />

        {/* Props: Coffee Mug and Steam */}
        <rect x="230" y="375" width="25" height="25" rx="3" fill="#ecf0f1" />
        <path d="M 225 385 Q 215 385 215 395 Q 215 405 230 400" stroke="#ecf0f1" strokeWidth="4" fill="none" />
        <motion.path
          d="M 235 365 Q 240 355 235 345" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"
          animate={{ y: [0, -15], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.path
          d="M 245 360 Q 240 350 245 340" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"
          animate={{ y: [0, -15], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
        />

        {/* Props: Books */}
        <rect x="580" y="385" width="50" height="15" rx="3" fill="#e74c3c" />
        <rect x="585" y="370" width="40" height="15" rx="3" fill="#3498db" />
        
        {/* Plants / Decor */}
        <path d="M 200 400 Q 180 350 160 370 M 200 400 Q 190 330 210 340" stroke="#27ae60" strokeWidth="8" strokeLinecap="round" fill="none" />
        <polygon points="180,400 220,400 210,380 190,380" fill="#e67e22" />
      </svg>
    </div>
  );
};

// Simple component for the pixelated jagged border transition
function PixelBorder() {
  const pixels = [
    { h: '80px', w: '60px' }, { h: '0px', w: '40px' }, { h: '40px', w: '60px' },
    { h: '120px', w: '60px' }, { h: '0px', w: '40px' }, { h: '60px', w: '80px' },
    { h: '0px', w: '20px' }, { h: '40px', w: '60px' }, { h: '160px', w: '60px' },
    { h: '0px', w: '80px' }, { h: '60px', w: '80px' }, { h: '0px', w: '40px' },
    { h: '100px', w: '60px' }, { h: '40px', w: '60px' },
  ];

  return (
    <div className="w-full h-[160px] bg-white flex items-end justify-around overflow-hidden relative">
      <div className="flex items-end h-full w-full max-w-7xl mx-auto px-4">
        {pixels.map((p, i) => (
          <div key={i} className="bg-daInfo-dark flex-shrink-0" style={{ height: p.h, width: p.w, marginRight: '10px' }} />
        ))}
      </div>
      {/* Ensure bottom edge is solid black to seamlessly connect to the next section */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-daInfo-dark" />
    </div>
  );
}

const DEFAULT_FREELANCERS = [
  { _id: 'f1', name: 'Alex Rivera', skills: ['Product Design'], rating: 4.9, reviewCount: 124 },
  { _id: 'f2', name: 'Sarah Chen', skills: ['Full-stack'], rating: 4.8, reviewCount: 89 },
  { _id: 'f3', name: 'Marcus Thorne', skills: ['AI/ML'], rating: 5.0, reviewCount: 56 },
  { _id: 'f4', name: 'Elena Vance', skills: ['Cloud Arch'], rating: 4.7, reviewCount: 92 }
];

const DEFAULT_TESTIMONIALS = [
  { _id: 't1', comment: "MicroGig has transformed how we scale our engineering team. The quality of talent is consistently top-tier.", reviewer: { name: "Jonathan Wright" } },
  { _id: 't2', comment: "The speed of execution on this platform is unmatched. We had our dashboard ready in less than 48 hours.", reviewer: { name: "Aria Montgomery" } },
  { _id: 't3', comment: "Clear communication and secure payments make it my go-to for all our UI/UX needs.", reviewer: { name: "Vikram Singh" } }
];

export default function Home() {
  const [freelancers, setFreelancers] = useState(DEFAULT_FREELANCERS);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [freeRes, testRes] = await Promise.all([
          fetch('/api/users?limit=4&sort=rating'),
          fetch('/api/reviews?limit=3&minRating=4')
        ]);
        
        let freeData = [];
        let testData = [];

        if (freeRes.ok) freeData = await freeRes.json();
        if (testRes.ok) testData = await testRes.json();

        if (freeData.length > 0) setFreelancers(freeData);
        if (testData.length > 0) setTestimonials(testData);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        // Fallbacks are already set in initial state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white">
      {/* ══════════ HERO SECTION ══════════ */}
      <section className="pt-32 pb-20 px-4 da-grid-bg min-h-screen flex flex-col justify-center items-center relative border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">

          <h1 className="da-heading text-daInfo-dark mb-8 whitespace-pre-line text-balance">
            {'Empowering Talent that\n'}
            <span className="da-blue-text">Delivers Across</span>
            {'\nDomains'}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium">
            Work remotely on diverse micro-gigs. Flexible hours. Competitive pay. No prior agency experience needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 font-mono text-sm tracking-widest font-bold">
            <Link to="/signup" className="da-btn-outline w-full sm:w-auto justify-center">
              APPLY AS A MICRO-EXPERT
            </Link>
            <div className="text-gray-500 uppercase flex items-center justify-center">
              STARTING AT <span className="text-daInfo-dark ml-2">$20-$50/HR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ AS SEEN ON (Logos) ══════════ */}
      <section className="border-b border-gray-200 bg-white">
        <div className="flex flex-wrap items-center">
          <div className="w-full md:w-auto px-8 py-6 font-bold text-gray-400 text-sm tracking-widest uppercase border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0">
            AS SEEN ON
          </div>
          <div className="flex-1 flex flex-wrap items-center justify-around py-4 px-4 gap-8 grayscale opacity-60">
            <span className="text-xl font-bold font-serif whitespace-nowrap">BUSINESS INSIDER</span>
            <span className="text-xl font-bold font-serif whitespace-nowrap">THE INDEPENDENT</span>
            <span className="text-xl font-extrabold tracking-tighter whitespace-nowrap">TIME</span>
            <span className="text-xl font-black italic whitespace-nowrap">BuzzFeed</span>
          </div>
        </div>
      </section>

      {/* ══════════ PIXEL TRANSITION ══════════ */}
      <PixelBorder />

      {/* ══════════ DARK SECTION ══════════ */}
      <section className="da-section-dark pt-12 pb-24">
        {/* Features List */}
        <div className="da-feature-list border-b border-gray-800 pb-20 mb-20">
          <div>
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center mb-6 text-pink-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="da-feature-item-title">100% REMOTE</h3>
            <p className="da-feature-item-desc">Work from anywhere while enjoying absolute flexibility.</p>
          </div>

          <div>
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center mb-6 text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="da-feature-item-title">FLEXIBLE HOURS</h3>
            <p className="da-feature-item-desc">Organize your time according to your convenience.</p>
          </div>

          <div>
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center mb-6 text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="da-feature-item-title">START QUICKLY</h3>
            <p className="da-feature-item-desc">Choose your projects, no extensive onboarding required.</p>
          </div>

          <div>
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center mb-6 text-yellow-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="da-feature-item-title">GET PAID</h3>
            <p className="da-feature-item-desc">Receive timely payments for your completed work via secure channels.</p>
          </div>
        </div>

        {/* Job Description block */}
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 mb-32 text-left">
          <div className="pr-12">
            <h2 className="text-5xl font-medium tracking-tight mb-8">Job description</h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                MicroGig is committed to creating quality micro-tasking ecosystems. Join our team to help complete specialized gigs while enjoying the flexibility of remote work and choosing your own schedule.
              </p>
              <p>
                We are looking for dedicated professionals to join our network as Micro-Experts. In this role, you will review, develop, and deliver project outputs across various domains ensuring accuracy, clarity, and natural flow while providing high-quality results.
              </p>
            </div>
          </div>

          {/* Pay Block */}
          <div className="bg-[#111111] border border-gray-800 p-8 h-fit da-shadow-pink">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 border-b border-gray-800 pb-8">
              <div>
                <p className="text-gray-400 font-bold tracking-widest text-xs uppercase mb-2 text-left">Starting at</p>
                <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2 text-left">
                  $20 - $50 USD <span className="text-xl text-gray-400 font-normal">/hour</span>
                </div>
                <p className="text-gray-400 text-sm text-left font-medium uppercase tracking-widest">+ bonuses for quality and speed</p>
              </div>
              <Link to="/signup" className="da-btn-primary self-start">
                APPLY NOW
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gray-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <div className="text-left">
                <p className="text-white font-bold mb-1">Working remotely</p>
                <p className="text-gray-400 text-sm">Flexible location and hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT US ══════════ */}
      <section className="bg-white py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 justify-between items-center text-left">
          <div className="flex-1">
            <h2 className="text-4xl font-medium tracking-tight mb-8">About Us</h2>
            <div className="space-y-6 text-gray-600 text-lg">
              <p>
                MicroGig was founded on the belief that traditional hiring models are too slow for modern execution. We are building a global network of vetted experts who can parachute into projects, deliver specialized outcomes, and get paid instantly.
              </p>
              <p>
                We do not rely on endless interviews or rigid contracts. Our platform assesses your capabilities and connects you directly to clients who need your exact skills right now.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full bg-gray-50 flex items-center justify-center aspect-[4/3] overflow-hidden border border-gray-200 da-shadow-black">
            <FreelancerAnimation />
          </div>
        </div>
      </section>

      {/* ══════════ OUR FREELANCERS ══════════ */}
      <section id="network" className="bg-gray-50 py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-medium tracking-tight mb-4 text-left">Our Elite Network</h2>
              <p className="text-gray-500 text-lg max-w-2xl text-left">Collaborate with the top 1% of independent specialists across design, engineering, and artificial intelligence.</p>
            </div>
            <Link to="/freelancers" className="da-btn-outline mt-6 md:mt-0 shadow-sm">VIEW DIRECTORY</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-56 bg-white border border-gray-100 animate-pulse shadow-sm" />
              ))
            ) : freelancers.map((f, i) => (
              <div key={f._id} className="bg-white border-2 border-black p-6 flex flex-col justify-between h-56 hover:-translate-y-1 hover:translate-x-1 transition-transform da-shadow-black">
                <div>
                  <h3 className="font-bold text-black tracking-tight uppercase">{f.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {f.skills[0]} Specialist
                  </p>
                </div>
                <div>
                  <div className="h-[1px] w-full bg-gray-100 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black uppercase tracking-widest bg-yellow-50 px-2 py-0.5 border border-yellow-200">★ {f.rating}</span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{f.reviewCount} REVIEWS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CUSTOMER TESTIMONIALS ══════════ */}
      <section id="testimonials" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <h2 className="text-4xl font-medium tracking-tight mb-16 text-center">What people are saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-gray-50/50 animate-pulse border border-gray-100" />
              ))
            ) : testimonials.map((t, i) => (
              <div key={t._id} className="flex flex-col justify-between">
                <p className="text-xl text-gray-800 leading-relaxed font-medium tracking-tight">"{t.comment}"</p>
                <div className="mt-8 border-l-[3px] border-black pl-4 flex flex-col justify-end">
                  <span className="text-sm font-bold text-black uppercase tracking-[0.2em]">{t.reviewer?.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">CLIENT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
