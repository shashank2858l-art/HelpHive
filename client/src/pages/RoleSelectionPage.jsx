import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuth } from '../context/AuthContext';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, immediately redirect them to their strict role dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/volunteer', { replace: true });
    }
  }, [user, navigate]);

  const onContinue = (selectedRole) => {
    if (!user) {
      navigate(`/login?role=${selectedRole}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-2xl rounded-2xl p-6"
      >
        <h1 className="text-center font-['Sora'] text-2xl font-bold">Choose Dashboard</h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Continue as Admin or Volunteer.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-4">
            <p className="font-semibold">Admin</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage operations, events, analytics, and resources.</p>
            <AnimatedButton onClick={() => onContinue('admin')} className="mt-4 w-full">
              Open Admin Dashboard
            </AnimatedButton>
          </div>

          <div className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-4">
            <p className="font-semibold">Volunteer</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Track activities, tasks, map updates, and impact.</p>
            <AnimatedButton onClick={() => onContinue('volunteer')} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
              Open Volunteer Dashboard
            </AnimatedButton>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default RoleSelectionPage;
