import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// Lazy LOAD Pages
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Freelancers = lazy(() => import('./pages/Freelancers'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PostJob = lazy(() => import('./pages/PostJob'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading Page Component
const PageLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-16 h-16 border-4 border-gray-200 border-t-daInfo-dark animate-spin" />
    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Module...</p>
  </div>
);

function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/dashboard' || location.pathname === '/jobs/new' || location.pathname === '/settings' || location.pathname === '/notifications';

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="mesh-bg" />
      {/* Render Navbar globally */}
      <Navbar />
      <main className={`flex-1 pt-20`}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<PostJob />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
