import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      const result = await googleLogin(tokenResponse.access_token);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed.');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('client@example.com');
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const result = await login('client@example.com', 'password123');
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Demo account not available.');
      }
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    setEmail('admin@microgig.com');
    setPassword('AdminPassword123');
    setError('');
    setLoading(true);
    try {
      const result = await login('admin@microgig.com', 'AdminPassword123');
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Admin account not available.');
      }
    } catch (err) {
      setError('Admin demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-daInfo-blue selection:text-white">
      
      {/* Left side - Graphic Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] flex-col justify-between p-16 relative overflow-hidden">
        {/* Background typographic watermark */}
        <div className="absolute -top-12 -left-12 opacity-[0.03] text-white">
          <h1 className="text-[20rem] font-bold leading-none tracking-tighter">MG.</h1>
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-center">
          
          <div className="max-w-md">
             <div className="w-16 h-2 bg-daInfo-blue mb-8"></div>
             <h2 className="text-5xl font-medium leading-tight text-white mb-6 tracking-tight">Access the work network.</h2>
             <p className="text-gray-400 text-xl leading-relaxed">Sign in to manage your micro-tasks, connect with top-tier talent, and accelerate your project timelines securely.</p>
          </div>
          <div /> {/* spacing placeholder */}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 da-grid-bg flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] p-8 sm:p-12">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Workspace Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-daInfo-dark outline-none bg-transparent text-daInfo-dark font-medium transition-colors placeholder-gray-300"
                placeholder="name@company.com"
              />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Password</label>
                 <button type="button" onClick={() => toast.info('Password reset is coming soon. Please contact support.')} className="text-xs font-bold text-gray-500 hover:text-daInfo-dark transition-colors uppercase tracking-widest">Forgot?</button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-daInfo-dark outline-none bg-transparent text-daInfo-dark font-medium transition-colors placeholder-gray-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-5 text-sm font-bold text-white uppercase tracking-widest transition-all duration-200 bg-[#0a0a0a] hover:bg-black mt-4 group"
            >
              {loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
              <span className="w-2 h-2 bg-daInfo-blue absolute right-6 group-hover:bg-white transition-colors" />
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleAuth()}
              className="w-full relative inline-flex items-center justify-center gap-3 px-6 py-5 text-sm font-bold text-daInfo-dark uppercase tracking-widest transition-all duration-200 border-2 border-gray-200 hover:border-black bg-white group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              New here?{' '}
              <Link to="/signup" className="font-bold text-daInfo-dark hover:text-daInfo-blue transition-colors">
                Apply for an account
              </Link>
            </p>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleDemoLogin}
                className="text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest border border-gray-200 px-3 py-2"
              >
                DEMO LOGIN
              </button>
              <button 
                type="button" 
                onClick={handleAdminDemoLogin}
                className="text-xs font-bold text-red-500 hover:text-red-750 transition-colors uppercase tracking-widest border border-red-200 bg-red-50/10 px-3 py-2"
              >
                DEMO ADMIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
