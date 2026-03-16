import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery === 'admin' || roleFromQuery === 'volunteer') {
      setRole(roleFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user?.role) return;
    navigate('/role-selection', { replace: true });
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle(role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Auth failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center"
      >
        <h1 className="mb-2 font-['Sora'] text-2xl font-bold text-center">HelpHive Login</h1>
        <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">Access your admin or volunteer dashboard securely.</p>

        <div className="w-full space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-1">
            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === 'volunteer' ? 'bg-emerald-600 text-white' : 'text-[var(--text-secondary)]'}`}
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === 'admin' ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)]'}`}
            >
              Admin
            </button>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)]"
          />
        </div>

        {error ? <p className="mb-3 w-full rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">{error}</p> : null}

        <div className="w-full space-y-4">
          <AnimatedButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </AnimatedButton>

          {role === 'volunteer' && (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-[var(--border-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">OR</span>
                <div className="h-px flex-1 bg-[var(--border-muted)]" />
              </div>

              <AnimatedButton
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-300"
                disabled={submitting}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </AnimatedButton>
            </>
          )}


          <p className="text-center text-xs text-[var(--text-secondary)]">
            New here? <Link to={`/register?role=${role}`} className="font-semibold text-[var(--text-primary)]">Register here</Link>
          </p>
        </div>
      </motion.form>
    </div>
  );
};

export default LoginPage;
