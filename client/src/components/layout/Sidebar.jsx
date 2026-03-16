import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Compass,
  Gauge,
  Hexagon,
  Lightbulb,
  Medal,
  Menu,
  Package,
  Settings,
  Users,
  X,
  LogOut,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: Gauge },
  { to: '/volunteers', label: 'Volunteers', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/resources', label: 'Resources', icon: Package },
  { to: '/map-tracking', label: 'Map Tracking', icon: Compass },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const volunteerLinks = [
  { to: '/volunteer', label: 'Dashboard', icon: Gauge },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/map-tracking', label: 'Map Tracking', icon: Compass },
  { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
  { to: '/ai', label: 'AI Insights', icon: Lightbulb },
  { to: '/profile', label: 'Profile', icon: CircleUserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 88 },
};

const SidebarContent = ({ collapsed, onToggleCollapse, onNavigate }) => {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;

  return (
    <>
      <div className="mb-6 flex items-center justify-between px-2">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/30">
            <Hexagon className="h-4 w-4" />
          </div>
          {!collapsed && <p className="font-['Sora'] text-lg font-semibold tracking-tight">HelpHive</p>}
        </Link>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] p-1.5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] lg:block"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1.5 flex-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                isActive
                  ? 'bg-[var(--active-bg)] text-[var(--active-text)] shadow-[0_0_0_1px_var(--active-outline),0_0_28px_var(--active-glow)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 space-y-3">
        <button
          onClick={() => {
            logout();
            if (onNavigate) onNavigate();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 opacity-80 transition hover:bg-rose-500/10 hover:opacity-100"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-3 text-xs text-[var(--text-secondary)]">
          {!collapsed ? (
            <>
              <p className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Mission Pulse</p>
              <p>27 active drives coordinated this week.</p>
            </>
          ) : (
            <Menu className="mx-auto h-4 w-4" />
          )}
        </div>
      </div>
    </>
  );
};

const Sidebar = ({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => (
  <>
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.26, ease: 'easeInOut' }}
      className="relative hidden min-h-screen flex-col border-r border-[var(--border-muted)] bg-[var(--bg-elevated)] px-3 py-4 xl:flex"
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </motion.aside>

    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-slate-950/50 xl:hidden"
          />

          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[var(--border-muted)] bg-[var(--bg-elevated)] p-4 xl:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-['Sora'] text-lg font-semibold">HelpHive</p>
              <button
                type="button"
                className="rounded-lg border border-[var(--border-muted)] p-1.5"
                onClick={onCloseMobile}
                aria-label="Close mobile sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent collapsed={false} onToggleCollapse={onToggleCollapse} onNavigate={onCloseMobile} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  </>
);

export default Sidebar;
