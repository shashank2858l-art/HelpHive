import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Moon, Search, Sun, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useSocket } from '../../hooks/useSocket';

const Topbar = ({ onOpenMobileSidebar, collapsed }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { liveEvents } = useSocket();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.fullName || 'Coordinator';
  const unreadCount = liveEvents.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="mb-5 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-soft)] px-4 py-3 shadow-lg backdrop-blur md:mb-6 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="rounded-lg border border-[var(--border-muted)] p-2 text-[var(--text-secondary)] xl:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Smart Volunteer and Resource Coordination Platform</p>
            <p className="font-['Sora'] text-lg font-semibold tracking-tight">Welcome back, {displayName}</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 lg:flex lg:w-[320px]">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            placeholder="Search volunteers, events, resources..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <motion.button
            whileHover={{ y: -2 }}
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>

          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm shadow-rose-500/40">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-soft)]/95 shadow-xl backdrop-blur-xl z-50"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-muted)] bg-[var(--card-elevated)]/50 px-4 py-3">
                    <h3 className="font-['Outfit'] font-semibold text-[var(--text-primary)]">Notifications</h3>
                    <span className="text-xs text-[var(--text-muted)]">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto">
                    {liveEvents.length > 0 ? (
                      <div className="flex flex-col">
                        {liveEvents.map((evt) => (
                          <div key={evt.id} className="relative flex gap-3 border-b border-[var(--border-muted)] p-4 transition hover:bg-[var(--surface-hover)] last:border-0">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
                              <Bell className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{evt.message}</p>
                              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                                {new Date(evt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
                        <p className="text-sm font-medium text-[var(--text-primary)]">All caught up!</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">No new notifications at the moment.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && <span className="hidden text-sm font-medium md:block">{displayName}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
