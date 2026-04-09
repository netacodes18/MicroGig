import { Zap, Target, Heart, Shield, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    { icon: Target, title: 'Skill-First', desc: 'We believe in rewarding ability, not availability. Every gig is priced by output, not hours.' },
    { icon: Zap, title: 'Speed', desc: 'From posting to completion in hours, not weeks. Our platform is built for absolute velocity.' },
    { icon: Shield, title: 'Trust', desc: 'Secure escrow payments, verified profiles, and transparent reviews keep everyone strictly accountable.' },
    { icon: Heart, title: 'Community', desc: 'We are building more than a platform — we are building a hyper-efficient movement of top creators.' },
  ];

  const team = [
    { name: 'Utkarsh Pratap', role: 'Founder & CEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=utkarsh' },
    { name: 'Ananya Rao', role: 'CTO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya-rao' },
    { name: 'Karthik Menon', role: 'Head of Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karthik' },
    { name: 'Diya Sharma', role: 'Head of Growth', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diya' },
  ];

  const milestones = [
    { year: '2024', title: 'Founded', desc: 'MicroGig was born from a dorm room idea' },
    { year: '2024', title: '1,000 Users', desc: 'Crossed our first thousand in 3 months' },
    { year: '2025', title: '10K+ Gigs', desc: 'Over ten thousand tasks completed' },
    { year: '2025', title: '₹24L+ Paid', desc: 'Millions paid out to creators worldwide' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="da-grid-bg pt-32 pb-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 bg-white mb-8">
            <Globe className="w-4 h-4 text-daInfo-dark" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-daInfo-dark tracking-tight leading-none">
            REDEFINING HOW <br /> THE WORLD WORKS.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            MicroGig is the elite micro-internship marketplace connecting top creators with businesses aiming for velocity. No fluff. No overhead. Just pure talent.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight uppercase">Platform Values</h2>
            <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mt-2">The principles driving our infrastructure</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-gray-200 p-8 flex flex-col group hover:border-daInfo-dark transition-colors bg-gray-50 relative">
                <div className="w-12 h-12 border-2 border-daInfo-dark mb-6 flex items-center justify-center bg-white">
                  <Icon className="w-6 h-6 text-daInfo-dark" />
                </div>
                <h3 className="text-lg font-bold text-daInfo-dark mb-3 uppercase tracking-tight">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-daInfo-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 border-b border-gray-200 da-grid-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight uppercase">Our Journey</h2>
          </div>
          
          <div className="border-l-2 border-gray-200 ml-4 md:ml-[50%] space-y-12 pb-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative pl-8 md:pl-0">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] md:-left-[5px] top-0 w-2.5 h-2.5 bg-daInfo-dark border-2 border-white rounded-full" />
                
                <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:-ml-[50%] md:text-right text-left' : 'md:pl-12 md:ml-0 text-left'}`}>
                  <div className="border border-gray-200 bg-white p-6 shadow-sm hover:border-daInfo-dark transition-colors">
                    <span className="text-xs font-bold text-daInfo-blue uppercase tracking-widest block mb-2">{m.year}</span>
                    <h3 className="text-xl font-bold text-daInfo-dark uppercase tracking-tight mb-2">{m.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight uppercase">Executive Team</h2>
            <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mt-2">The architects of the platform</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((t) => (
              <div key={t.name} className="border border-gray-200 p-6 flex flex-col group hover:border-daInfo-dark transition-colors text-center relative bg-gray-50">
                <div className="mb-6 relative inline-block mx-auto">
                  <img src={t.avatar} alt={t.name} className="w-24 h-24 border-2 border-daInfo-dark object-cover bg-white" />
                </div>
                <h3 className="text-lg font-bold text-daInfo-dark uppercase tracking-tight">{t.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-4">{t.role}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-daInfo-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-daInfo-dark text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight uppercase">
            JOIN THE REVOLUTION
          </h2>
          <p className="text-xl text-gray-400 mb-10 font-medium">
            Be part of the fastest-growing micro-work community infrastructure in India.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-daInfo-dark font-bold uppercase tracking-widest border border-white hover:bg-transparent hover:text-white transition-colors">
            GET STARTED <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
