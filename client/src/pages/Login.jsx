import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              New here?{' '}
              <Link to="/signup" className="font-bold text-daInfo-dark hover:text-daInfo-blue transition-colors">
                Apply for an account
              </Link>
            </p>
            <button 
              type="button" 
              onClick={handleDemoLogin}
              className="text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest border border-gray-200 px-3 py-2"
            >
              DEMO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
