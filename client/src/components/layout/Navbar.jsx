import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'FREELANCERS', path: '/freelancers' },
    { name: 'ABOUT US', path: '/about' },
    { name: user?.role === 'client' ? 'YOUR POSTINGS' : 'DOMAINS', path: '/jobs' },
    { name: 'TESTIMONIALS', path: '/#network' },
    { name: 'CONTACT US', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tighter text-daInfo-dark">
              MICRO<br/><span className="text-xs leading-none">GIG</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <div key={link.name} className="flex items-center gap-4">
                <Link
                  to={link.path}
                  className="text-xs font-semibold text-gray-500 hover:text-daInfo-dark tracking-widest uppercase transition-colors"
                >
                  {link.name}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="text-gray-300">/</span>
                )}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-xs font-semibold text-gray-500 hover:text-daInfo-dark tracking-widest uppercase">
                  DASHBOARD
                </Link>
                <button onClick={logout} className="text-xs font-semibold text-gray-500 hover:text-daInfo-dark tracking-widest uppercase">
                  SIGN OUT
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-gray-500 hover:text-daInfo-dark tracking-widest uppercase transition-colors">
                  SIGN IN
                </Link>
                <Link to="/signup" className="da-btn-primary">
                  APPLY NOW
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-daInfo-dark"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-bold text-gray-600 tracking-widest uppercase"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-sm font-bold text-gray-600 tracking-widest uppercase">
                    DASHBOARD
                  </Link>
                  <button onClick={logout} className="text-left text-sm font-bold text-gray-600 tracking-widest uppercase">
                    SIGN OUT
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-gray-600 tracking-widest uppercase">SIGN IN</Link>
                  <Link to="/signup" className="text-sm font-bold text-daInfo-blue tracking-widest uppercase">APPLY NOW</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
