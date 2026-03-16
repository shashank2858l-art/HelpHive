import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
// Firebase Authentication setup
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('ngo_token')));

  useEffect(() => {
    const token = localStorage.getItem('ngo_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('ngo_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ngo_token', data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (role = 'volunteer') => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      const { data } = await api.post('/auth/google', { token, role });
      localStorage.setItem('ngo_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('ngo_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('ngo_token');
    setUser(null);
  };

  const switchRole = async () => {
    // Basic role switch logic
    const nextRole = user?.role === 'admin' ? 'volunteer' : 'admin';
    return nextRole;
  };

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, register, switchRole, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
