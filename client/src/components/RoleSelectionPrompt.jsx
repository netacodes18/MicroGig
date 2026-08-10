import { useAuth } from '../context/AuthContext';
import { Briefcase, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function RoleSelectionPrompt() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = async (role) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('microgig_token');
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role }) // Assuming the backend allows role update for unassigned users
      });
      
      if (res.ok) {
         // Reload page to re-evaluate routing
         window.location.reload();
      } else {
         const data = await res.json();
         setError(data.message || 'Failed to assign role.');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-black text-daInfo-dark tracking-tighter uppercase leading-none mb-4">
            Select Your Path
          </h1>
          <p className="text-gray-500 font-bold">Please select how you plan to use MicroGig.</p>
        </div>
        
        {error && <p className="text-red-500 font-bold">{error}</p>}
        
        <div className="grid md:grid-cols-2 gap-6">
          <button 
            onClick={() => handleSelectRole('client')}
            disabled={loading}
            className="p-8 border-4 border-black hover:bg-daInfo-dark hover:text-white transition-all da-shadow-black group text-left flex flex-col items-center justify-center space-y-4"
          >
             <Building2 className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
             <h3 className="text-2xl font-black uppercase tracking-tight">I'm Hiring</h3>
             <p className="text-xs font-bold text-gray-400 group-hover:text-gray-200 text-center">I want to post jobs and recruit talent.</p>
          </button>
          
          <button 
            onClick={() => handleSelectRole('freelancer')}
            disabled={loading}
            className="p-8 border-4 border-black hover:bg-daInfo-blue hover:text-white transition-all da-shadow-black group text-left flex flex-col items-center justify-center space-y-4"
          >
             <Briefcase className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
             <h3 className="text-2xl font-black uppercase tracking-tight">I'm a Freelancer</h3>
             <p className="text-xs font-bold text-gray-400 group-hover:text-gray-200 text-center">I want to find gigs and offer services.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
