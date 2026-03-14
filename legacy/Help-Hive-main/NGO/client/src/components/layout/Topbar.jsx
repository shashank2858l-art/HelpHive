import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-6 flex flex-shrink-0 items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-tertiary">Volunteer Command Center</p>
        <p className="font-bold text-text-primary">Welcome, {user?.fullName || 'Coordinator'}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-xl bg-black/5 p-2.5 hover:bg-black/10 transition-colors text-text-primary"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="rounded-xl bg-black/5 p-2.5 hover:bg-black/10 transition-colors text-text-primary" aria-label="Alerts">
          <Bell className="h-4 w-4" />
        </button>
        <button
          onClick={logout}
          className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
