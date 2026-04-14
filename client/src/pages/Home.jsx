import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Globe, Clock, Zap, CreditCard, Users, Star, ChevronRight } from 'lucide-react';

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

const DEFAULT_FREELANCERS = [
  { _id: 'f1', name: 'Alex Rivera', skills: ['Graphic Design'], rating: 4.9, reviewCount: 124, avatar: '' },
  { _id: 'f2', name: 'Sarah Chen', skills: ['Marketing'], rating: 4.8, reviewCount: 89, avatar: '' },
  { _id: 'f3', name: 'Marcus Thorne', skills: ['Accounting'], rating: 5.0, reviewCount: 56, avatar: '' },
  { _id: 'f4', name: 'Elena Vance', skills: ['Photography'], rating: 4.7, reviewCount: 92, avatar: '' }
];

const DEFAULT_TESTIMONIALS = [
  { _id: 't1', comment: "MicroGig has transformed how we scale our engineering team. The quality of talent is consistently top-tier.", reviewer: { name: "Jonathan Wright" } },
  { _id: 't2', comment: "The speed of execution on this platform is unmatched. We had our dashboard ready in less than 48 hours.", reviewer: { name: "Aria Montgomery" } },
  { _id: 't3', comment: "Clear communication and secure payments make it my go-to for all our UI/UX needs.", reviewer: { name: "Vikram Singh" } }
];

const STATS = [
  { value: '2,500+', label: 'Active Gigs' },
  { value: '98%', label: 'Satisfaction' },
  { value: '$1.2M+', label: 'Paid Out' },
  { value: '50+', label: 'Domains' },
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

        if (freeRes.ok) {
          const parsed = await freeRes.json();
          freeData = parsed.freelancers || parsed; 
        }
        if (testRes.ok) testData = await testRes.json();

        if (freeData.length > 0) setFreelancers(freeData);
        // Ensure at least 3 testimonials — blend real with defaults
        if (testData.length >= 3) {
          setTestimonials(testData.slice(0, 3));
        } else if (testData.length > 0) {
          const padded = [...testData, ...DEFAULT_TESTIMONIALS.slice(testData.length)];
          setTestimonials(padded.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        // Fallbacks are already set in initial state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
  };

  return (
    <div className="bg-white">
      {/* ══════════ HERO SECTION ══════════ */}
      <section className="pt-28 pb-24 px-4 da-grid-bg min-h-[90vh] flex flex-col justify-center items-center relative border-b border-gray-200 overflow-hidden">
        {/* Subtle floating elements */}
        <motion.div 
          className="absolute top-[20%] left-[8%] w-16 h-16 border-2 border-gray-200 opacity-30"
          animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-[25%] right-[10%] w-3 h-3 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-[40%] right-[15%] w-8 h-8 border border-pink-300 rounded-full opacity-20"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-10"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Now Accepting Applications
          </motion.div>

          <motion.h1 
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="da-heading text-daInfo-dark mb-8 whitespace-pre-line text-balance"
          >
            {'Empowering Talent that\n'}
            <span className="da-blue-text">Delivers Across</span>
            {'\nDomains'}
          </motion.h1>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-gray-500 mb-14 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Work remotely on diverse micro-gigs. Flexible hours. Competitive pay. No prior agency experience needed.
          </motion.p>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col xs:flex-row items-center justify-center gap-5 w-full max-w-[280px] xs:max-w-none mx-auto"
          >
            <Link to="/signup" className="da-btn-primary text-sm px-8 py-5 group w-full xs:w-auto justify-center">
              GET STARTED
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/jobs" className="da-btn-outline text-sm px-8 py-5 w-full xs:w-auto justify-center">
              EXPLORE GIGS
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`py-10 px-6 text-center border-gray-200 
                ${i % 2 === 0 ? 'border-r' : 'md:border-r'} 
                ${i < 2 ? 'border-b md:border-b-0' : ''} 
                ${i === 3 ? 'md:border-r-0' : ''}`}
            >
              <div className="text-3xl md:text-4xl font-bold text-daInfo-dark tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES SECTION ══════════ */}
      <section className="da-section-dark py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">Why Micro Gig</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">Built for modern work</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { icon: <Globe className="w-6 h-6" />, color: 'text-pink-400', title: '100% REMOTE', desc: 'Work from anywhere while enjoying absolute flexibility.' },
              { icon: <Clock className="w-6 h-6" />, color: 'text-blue-400', title: 'FLEXIBLE HOURS', desc: 'Organize your time according to your convenience.' },
              { icon: <Zap className="w-6 h-6" />, color: 'text-green-400', title: 'START QUICKLY', desc: 'Choose your projects, no extensive onboarding required.' },
              { icon: <CreditCard className="w-6 h-6" />, color: 'text-yellow-400', title: 'GET PAID', desc: 'Receive timely payments via secure Razorpay channels.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`p-10 border-b lg:border-b-0 border-gray-800 ${i < 3 ? 'lg:border-r' : ''} group hover:bg-white/[0.03] transition-colors`}
              >
                <div className={`w-12 h-12 border border-gray-700 rounded-full flex items-center justify-center mb-6 ${feature.color} group-hover:border-gray-500 transition-colors`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Job Description + Pay Block */}
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 mt-28 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="pr-0 lg:pr-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Open Position</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Micro-Expert</h2>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                MicroGig is committed to creating quality micro-tasking ecosystems. Join our team to help complete specialized gigs while enjoying the flexibility of remote work and choosing your own schedule.
              </p>
              <p>
                We are looking for dedicated professionals to join our network. In this role, you will review, develop, and deliver project outputs across various domains ensuring accuracy, clarity, and natural flow.
              </p>
            </div>
          </motion.div>

          {/* Pay Block */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#111111] border border-gray-800 p-8 lg:p-10 h-fit da-shadow-pink"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 border-b border-gray-800 pb-8">
              <div>
                <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-2 text-left">Starting at</p>
                <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2 text-left">
                  $20 - $50 <span className="text-xl text-gray-500 font-normal">USD/hr</span>
                </div>
                <p className="text-gray-500 text-sm text-left font-medium uppercase tracking-widest">+ bonuses for quality and speed</p>
              </div>
              <Link to="/signup" className="da-btn-primary self-start">
                APPLY NOW
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold mb-0.5">Working remotely</p>
                  <p className="text-gray-500 text-sm">Flexible location and hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold mb-0.5">All experience levels</p>
                  <p className="text-gray-500 text-sm">From students to professionals</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ ABOUT US ══════════ */}
      <section className="bg-white py-28 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 justify-between items-center text-left">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">About Us</h2>
            <div className="space-y-6 text-gray-500 text-lg leading-relaxed">
              <p>
                MicroGig was founded on the belief that traditional hiring models are too slow for modern execution. We are building a global network of vetted experts who can parachute into projects, deliver specialized outcomes, and get paid instantly.
              </p>
              <p>
                We do not rely on endless interviews or rigid contracts. Our platform assesses your capabilities and connects you directly to clients who need your exact skills right now.
              </p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-[0.2em] text-daInfo-dark hover:gap-4 transition-all group">
              Learn more about us 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full bg-gray-50 flex items-center justify-center aspect-[4/3] overflow-hidden border border-gray-200 da-shadow-black"
          >
            <FreelancerAnimation />
          </motion.div>
        </div>
      </section>

      {/* ══════════ OUR FREELANCERS ══════════ */}
      <section id="network" className="bg-gray-50 py-28 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-end justify-between mb-16"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-blue-500" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Talent Pool</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-left">Our Elite Network</h2>
              <p className="text-gray-500 text-lg max-w-2xl text-left">Collaborate with the top 1% of independent specialists across creative, business, and technical domains.</p>
            </div>
            <Link to="/freelancers" className="da-btn-outline mt-6 md:mt-0 shadow-sm">VIEW DIRECTORY</Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white border border-gray-100 animate-pulse" />
              ))
            ) : freelancers.map((f, i) => (
              <motion.div 
                key={f._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-black p-6 flex flex-col justify-between h-64 hover:-translate-y-1 transition-all da-shadow-black group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`} 
                      alt={f.name}
                      className="w-10 h-10 border border-gray-200 bg-gray-50 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-black tracking-tight uppercase text-sm">{f.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {f.skills[0]} Specialist
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="h-[1px] w-full bg-gray-100 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black uppercase tracking-widest bg-yellow-50 px-2 py-0.5 border border-yellow-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {f.rating}
                    </span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{f.reviewCount} REVIEWS</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CUSTOMER TESTIMONIALS ══════════ */}
      <section id="testimonials" className="bg-white py-28">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">What people are saying</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-gray-50/50 animate-pulse border border-gray-100" />
              ))
            ) : testimonials.map((t, i) => (
              <motion.div 
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col justify-between group"
              >
                <div className="text-5xl text-gray-200 font-serif leading-none mb-4 group-hover:text-blue-200 transition-colors">"</div>
                <p className="text-xl text-gray-700 leading-relaxed font-medium tracking-tight">{t.comment}</p>
                <div className="mt-8 border-l-[3px] border-black pl-4 flex flex-col justify-end">
                  <span className="text-sm font-bold text-black uppercase tracking-[0.2em]">{t.reviewer?.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">CLIENT</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section className="da-section-dark py-28 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Ready to start earning?</h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Join thousands of freelancers already earning on MicroGig. No agency fees. No long interviews. Just work and get paid.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/signup" className="da-btn-primary text-sm px-10 py-5 group">
                CREATE YOUR ACCOUNT
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/freelancers" className="text-sm font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                View the network <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
