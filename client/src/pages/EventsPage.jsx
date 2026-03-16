import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, Trash2 } from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';
import PageHeader from '../components/ui/PageHeader';
import { StaggerItem, StaggerSection } from '../components/ui/StaggerSection';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    volunteersRequired: 0,
    requiredSkills: '',
    resourcesUsed: 0,
  });
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/events'), api.get('/volunteers?status=approved')])
      .then(([eventsRes, volunteersRes]) => {
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        setVolunteers(Array.isArray(volunteersRes.data) ? volunteersRes.data : []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load events.');
      });
  }, []);

  const handleCreateEvent = async () => {
    const skills = formData.requiredSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const aiMatches = volunteers
      .filter((volunteer) => {
        const skillMatch = skills.length === 0 || skills.some((skill) => volunteer.skills?.includes(skill));
        const locationMatch = volunteer.location?.toLowerCase() === formData.location.toLowerCase();
        return skillMatch || locationMatch;
      })
      .slice(0, 3);

    setMatches(aiMatches);

    try {
      const payload = {
        title: formData.name,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        volunteersRequired: Number(formData.volunteersRequired) || 0,
        resourcesRequired: [],
        status: 'planned',
      };

      const { data } = await api.post('/events', payload);
      setEvents((prev) => [data, ...prev]);
      setFormData({
        name: '',
        date: '',
        location: '',
        description: '',
        volunteersRequired: 0,
        requiredSkills: '',
        resourcesUsed: 0,
      });
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  const handleJoinEvent = (eventId) => {
    api
      .post(`/events/${eventId}/join`)
      .then(({ data }) => {
        setEvents((prev) => prev.map((event) => (event._id === eventId ? data : event)));
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to join event.'));
  };

  const handleDeleteEvent = (eventId) => {
    api
      .delete(`/events/${eventId}`)
      .then(() => setEvents((prev) => prev.filter((event) => event._id !== eventId)))
      .catch((err) => setError(err.response?.data?.message || 'Unable to delete event.'));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      
      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });

      try {
        const payload = data.map(item => ({
          title: item.title || item.name || 'Bulk Event',
          description: item.description || '',
          location: item.location || '',
          date: item.date || new Date().toISOString(),
          volunteersRequired: Number(item.volunteersRequired) || 0,
          status: item.status || 'planned'
        }));

        await api.post('/events/bulk', { data: payload });
        window.location.reload();
      } catch (err) {
        setError('Failed to upload CSV. Ensure columns match: title, description, location, date, volunteersRequired');
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="space-y-5 pb-10 md:space-y-6">
      <PageHeader
        title="Events"
        subtitle="Create and monitor campaigns with volunteers, locations, and resource allocations"
        action={
          <div className="flex gap-2">
            <input
              type="file"
              id="csvUpload"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('csvUpload').click()}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-muted)] px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              Upload CSV
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="rounded-xl border border-[var(--border-muted)] px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              Refresh
            </button>
            {user?.role === 'admin' && <AnimatedButton onClick={() => setIsModalOpen(true)}>Create Event</AnimatedButton>}
          </div>
        }
      />

      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {events.length > 0 ? events.map((event, index) => (
          <article
            key={event._id || event.id || index}
            className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-['Outfit'] text-xl font-semibold text-white">
                {event.title || event.name || 'Untitled Event'}
              </h3>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                (event.status || 'planned') === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {event.status || 'planned'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <CalendarDays className="h-4 w-4" /> 
                {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" /> 
                {event.location || 'Online / TBD'}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" /> 
                Volunteers: {event.assignedVolunteers?.length || 0} / {event.volunteersRequired || 0}
              </p>
            </div>

            {user?.role === 'admin' ? (
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this event?')) {
                      handleDeleteEvent(event._id || event.id);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-white/5">
                 <button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                  onClick={() => handleJoinEvent(event._id || event.id)}
                >
                  Join Event
                </button>
              </div>
            )}
          </article>
        )) : (
          <div className="col-span-full py-10 text-center rounded-xl border border-dashed border-white/10">
            <p className="text-slate-400 text-sm">No events found. Click 'Create' or 'Upload CSV' to add some.</p>
          </div>
        )}
      </div>

      {/* DEBUG SECTION - ONLY VISIBLE IF THERE ARE ERRORS */}
      {events.length === 0 && !error && (
        <div className="hidden">
           Events length is 0. User role: {user?.role}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-slate-950/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-elevated)] p-5"
            >
              <h3 className="mb-4 font-['Outfit'] text-xl font-semibold">Create Event</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Event name"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  type="date"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requiredSkills: e.target.value }))}
                  placeholder="Required skills (comma separated)"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.volunteersRequired}
                  onChange={(e) => setFormData((prev) => ({ ...prev, volunteersRequired: Number(e.target.value) }))}
                  type="number"
                  placeholder="Volunteers required"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <input
                  value={formData.resourcesUsed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, resourcesUsed: Number(e.target.value) }))}
                  type="number"
                  placeholder="Resources used"
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none sm:col-span-2"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[var(--border-muted)] px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <AnimatedButton onClick={handleCreateEvent}>Create</AnimatedButton>
              </div>

              {matches.length > 0 && (
                <div className="mt-4 rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3">
                  <p className="mb-2 text-sm font-semibold text-cyan-200">AI Volunteer Match</p>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                    {matches.map((match) => (
                      <li key={match._id}>
                        {match.name} | {match.location} | {match.skills.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default EventsPage;

