import { Link } from 'react-router-dom';

export default function Footer() {
  const links = {
    Platform: [
      { name: 'DOMAINS', path: '/jobs' },
      { name: 'EXPERTS', path: '/freelancers' },
      { name: 'APPLY NOW', path: '/signup' },
      { name: 'DASHBOARD', path: '/dashboard' },
    ],
    Company: [
      { name: 'ABOUT US', path: '/about' },
      { name: 'CONTACT', path: '/contact' },
      { name: 'CAREERS', path: '/about' },
      { name: 'BLOG', path: '/' },
    ],
    Support: [
      { name: 'HELP CENTER', path: '/' },
      { name: 'TERMS OF SERVICE', path: '/' },
      { name: 'PRIVACY POLICY', path: '/' },
      { name: 'FAQS', path: '/' },
    ],
  };

  return (
    <footer className="bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-bold tracking-tighter text-white">
                MICRO<br/><span className="text-sm leading-none text-gray-400">GIG</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
              The platform connecting focused talent with impactful micro-tasks. Earn what you deserve, on your own terms.
            </p>
            <div className="flex items-center gap-4">
              {/* Minimal text-based social links */}
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Twitter</a>
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">LinkedIn</a>
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">GitHub</a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">{title}</h4>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MicroGig. All rights reserved.
          </p>
          <div className="flex gap-6">
             <Link className="text-sm text-gray-500 hover:text-white" to="/">Terms</Link>
             <Link className="text-sm text-gray-500 hover:text-white" to="/">Privacy</Link>
             <Link className="text-sm text-gray-500 hover:text-white" to="/">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
