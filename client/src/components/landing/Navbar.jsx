import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Menu, X, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../common/AnimatedLogo';
import { useTheme } from '../../hooks/useTheme';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '#about' },
  { name: 'Features', href: '#features' },
  { name: 'Events', href: '/events' },
  { name: 'Resources', href: '/resources' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 right-0 top-0 z-50 px-3 py-3 transition-all duration-300 md:px-4"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-black/5 bg-white/82 px-6 py-3 shadow-[0_8px_32px_rgba(14,24,20,0.10)] backdrop-blur-2xl transition-all duration-300">
        {/* Animated Custom Logo */}
        <Link to="/" className="group flex cursor-pointer items-center gap-2">
          <AnimatedLogo className="h-12 w-12" />
          <span className="font-outfit text-2xl font-bold tracking-tight text-text-primary transition-colors duration-300">
            Help<span className="text-gradient">Hive</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.href.startsWith('#') ? (
                  <a
                    href={link.href}
                    className="group relative cursor-pointer text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-text-primary"
                  >
                    {link.name}
                    {/* Hover Underline / Glow */}
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent-primary opacity-0 transition-all duration-300 ease-out group-hover:w-full group-hover:opacity-100" />
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="group relative cursor-pointer text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-text-primary"
                  >
                    {link.name}
                    {/* Hover Underline / Glow */}
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent-primary opacity-0 transition-all duration-300 ease-out group-hover:w-full group-hover:opacity-100" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <motion.button
            whileHover={{ y: -2 }}
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-secondary transition hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
          <Link
            to="/login?role=admin"
            className="cursor-pointer text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-text-primary"
          >
            Login
          </Link>
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/register?role=volunteer" className="btn-primary block px-5 py-2.5 text-sm">
              Signup
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle & Theme */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-4 right-4 top-[calc(100%+0.5rem)] mt-2 flex origin-top flex-col gap-2 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-3xl md:hidden"
          >
            {navLinks.map((link, i) => (
              link.href.startsWith('#') ? (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
                >
                  {link.name}
                </motion.a>
              ) : (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              )
            ))}
            <div className="my-2 h-px w-full bg-black/5" />
            <div className="flex flex-col gap-3 px-2 pb-2">
              <Link
                to="/login?role=admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer rounded-lg px-2 py-2 text-center text-base font-medium text-text-primary transition-colors hover:bg-black/5"
              >
                Login
              </Link>
              <Link
                to="/register?role=volunteer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full text-center text-base"
              >
                Signup
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
