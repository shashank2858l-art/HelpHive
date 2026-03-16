import { motion } from 'framer-motion';
import { Compass, MapPin, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuth } from '../context/AuthContext';

const ProfileCompletionPage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    location: user?.location || '',
    pincode: user?.pincode || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile(formData);
      navigate(user?.role === 'admin' ? '/admin' : '/volunteer');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    sessionStorage.setItem('skipProfileCompletion', 'true');
    navigate(user?.role === 'admin' ? '/admin' : '/volunteer');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[var(--bg-base)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <h1 className="mb-2 font-['Sora'] text-2xl font-bold text-[var(--text-primary)] text-center">Complete Your Profile</h1>
        <p className="mb-8 text-sm text-[var(--text-secondary)] text-center">
          Help us connect you with local opportunities by providing your location details.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)] group-focus-within:text-emerald-400" />
              <input
                type="text"
                placeholder="City / Area"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="relative group">
              <Compass className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)] group-focus-within:text-emerald-400" />
              <input
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 px-1">{error}</p>}

          <AnimatedButton type="submit" disabled={loading} className="w-full py-3">
            <Save className="mr-2 h-4 w-4 inline" /> {loading ? 'Saving...' : 'Save & Continue'}
          </AnimatedButton>

          <button
            type="button"
            onClick={skip}
            className="w-full text-center text-xs text-[var(--text-muted)] font-medium hover:text-[var(--text-secondary)] transition-colors py-2"
          >
            I'll do this later
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionPage;
