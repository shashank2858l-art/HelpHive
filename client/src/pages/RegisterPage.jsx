import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    pincode: '',
    skills: '',
    volunteerRole: '',
  });
  const [role, setRole] = useState('volunteer');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery === 'admin' || roleFromQuery === 'volunteer') {
      setRole(roleFromQuery);
    }
  }, [searchParams]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        location: form.location,
        pincode: form.pincode,
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        role,
      });
      navigate('/role-selection');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
      >
        <h1 className="mb-2 font-['Sora'] text-2xl font-bold">Create HelpHive Account</h1>
        <p className="mb-5 text-sm text-[var(--text-secondary)]">Register as admin or volunteer and continue to your role dashboard.</p>

        <div className="mb-4 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-emerald-400 text-sm font-medium">Registering as Volunteer</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['fullName', 'Full Name'],
            ['email', 'Email'],
            ['password', 'Password'],
            ['phone', 'Phone Number'],
            ['location', 'Location'],
            ['pincode', 'Pincode'],
            ['skills', 'Skills'],
            ['volunteerRole', 'Volunteer Role'],
          ].map(([name, label]) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={onChange}
              type={name === 'password' ? 'password' : 'text'}
              placeholder={label}
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)]"
              required={['fullName', 'email', 'password'].includes(name)}
            />
          ))}
        </div>

        {error && <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

        <AnimatedButton type="submit" className="mt-5 w-full">
          Register
        </AnimatedButton>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link to={`/login?role=${role}`} className="font-semibold text-[var(--accent-primary)]">Login</Link>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
