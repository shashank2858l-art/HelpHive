import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-bg-primary">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-black/5 bg-white shadow-2xl w-full max-w-md p-8"
      >
        <h1 className="mb-6 font-outfit text-3xl font-bold text-text-primary text-center">Welcome Back</h1>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider ml-1">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@organization.com"
              className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 outline-none focus:ring-2 focus:ring-accent-primary focus:bg-white transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider ml-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 outline-none focus:ring-2 focus:ring-accent-primary focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>}

        <AnimatedButton type="submit" className="mt-8 w-full !bg-accent-primary shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/30">
          Sign In
        </AnimatedButton>
        <p className="mt-6 text-center text-sm font-medium text-text-tertiary">
          New to HelpHive? <Link to="/register" className="text-accent-primary font-bold hover:underline">Create an account</Link>
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
