import { useAuth } from '../context/AuthContext';
import ClientSettings from './ClientSettings';
import FreelancerSettings from './FreelancerSettings';
import RoleSelectionPrompt from '../components/RoleSelectionPrompt';

export default function Settings() {
  const { user } = useAuth();

  if (!user) return null;

  if (!user.role || !['client', 'freelancer'].includes(user.role)) {
    return <RoleSelectionPrompt />;
  }

  return user.role === 'client' ? <ClientSettings /> : <FreelancerSettings />;
}
