import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'FREELANCERS', path: '/freelancers' },
    { name: 'ABOUT US', path: '/about' },
    { name: user?.role === 'client' ? 'YOUR POSTINGS' : 'DOMAINS', path: '/jobs' },
    { name: 'TESTIMONIALS', path: '/#testimonials' },
    { name: 'CONTACT US', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tighter text-daInfo-dark">
              MICRO<br /><span className="text-xs leading-none">GIG</span>
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
                <NotificationCenter />
                <Link to="/dashboard" className="hover:opacity-80 transition-opacity" title="Dashboard">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt={user.name}
                    className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-daInfo-dark transition-colors object-cover"
                  />
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col pt-24 px-8"
          >
            <div className="flex flex-col space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-4xl font-black text-daInfo-dark tracking-tighter uppercase flex items-center justify-between group"
                  >
                    {link.name}
                    <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pb-12 space-y-8">
              <div className="h-[2px] bg-gray-100 w-full" />
              {user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-lg font-bold text-daInfo-dark uppercase">{user.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileOpen(false)}
                      className="da-btn-outline justify-center py-4"
                    >
                      DASHBOARD
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMobileOpen(false); }}
                      className="text-xs font-black text-red-500 uppercase tracking-widest text-left"
                    >
                      SIGN OUT <br/> (LOGOUT)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileOpen(false)}
                    className="da-btn-outline justify-center py-4 text-center"
                  >
                    LOGIN
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMobileOpen(false)}
                    className="da-btn-primary justify-center py-4 text-center"
                  >
                    APPLY NOW
                  </Link>
                </div>
              )}
            </div>

            {/* Close helper */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-5 right-5 p-3 border-2 border-black"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
