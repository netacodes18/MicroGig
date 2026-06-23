import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check backend for stored user via cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error(err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('microgig_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const signup = async (name, email, password, role = 'freelancer', dob) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role, dob });
      if (data.token) {
        localStorage.setItem('microgig_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch(err) {
      console.error(err);
    }
    localStorage.removeItem('microgig_token');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser({ ...user, ...updates });
  };

  const googleLogin = async (token, role = 'freelancer') => {
    try {
      const { data } = await api.post('/auth/google', { token, role });
      if (data.token) {
        localStorage.setItem('microgig_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, updateUser, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

