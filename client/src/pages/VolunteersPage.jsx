import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Sparkles, Users, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/loader/SkeletonLoader';
import AnimatedButton from '../components/ui/AnimatedButton';
import PageHeader from '../components/ui/PageHeader';
import { StaggerItem, StaggerSection } from '../components/ui/StaggerSection';
import CsvUploader from '../components/common/CsvUploader';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { api } from '../services/api';

const VolunteersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { liveEvents } = useSocket();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [assigningVolunteer, setAssigningVolunteer] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = useCallback(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents([]));
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (availabilityFilter !== 'All') {
      params.set('availability', availabilityFilter === 'Available' ? 'true' : 'false');
    }

    api
      .get(`/volunteers${params.toString() ? `?${params}` : ''}`)
      .then((res) => setVolunteers(res.data || []))
      .catch((err) => {
        setVolunteers([]);
        setError(err?.response?.data?.message || 'Unable to load volunteers');
      })
      .finally(() => setLoading(false));
  }, [search, availabilityFilter]);

  useEffect(() => {
    loadEvents();
    loadData();
  }, [loadData, loadEvents]);

  useEffect(() => {
    if (!liveEvents.length) return;

    const shouldReload = ['volunteer:created', 'volunteer:updated', 'volunteer:deleted', 'volunteer:approved'].includes(
      liveEvents[0].eventName
    );

    if (shouldReload) {
      loadData();
    }
  }, [liveEvents, loadData]);

  const filteredVolunteers = useMemo(() => volunteers.filter((volunteer) => {
    const matchSkill = skillFilter === 'All' || volunteer.skills?.includes(skillFilter);
    const matchLocation = locationFilter === 'All' || volunteer.location === locationFilter;
    return matchSkill && matchLocation;
  }), [volunteers, skillFilter, locationFilter]);

  const allSkills = useMemo(
    () => ['All', ...new Set(volunteers.flatMap((volunteer) => volunteer.skills || []))],
    [volunteers]
  );
  const allLocations = useMemo(
    () => ['All', ...new Set(volunteers.map((volunteer) => volunteer.location).filter(Boolean))],
    [volunteers]
  );

  const openAssignModal = (volunteer) => {
    setAssigningVolunteer(volunteer);
    setSelectedEventId(events[0]?._id || '');
  };

  const assignEvent = () => {
    if (!assigningVolunteer || !selectedEventId) return;

    setSubmitting(true);
    api
      .post(`/events/${selectedEventId}/assign-volunteers`, {
        volunteerIds: [assigningVolunteer._id],
      })
      .then(() => {
        setAssigningVolunteer(null);
        setSelectedEventId('');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to assign event');
      })
      .finally(() => setSubmitting(false));
  };

  const handleApprove = (volunteerId) => {
    setVolunteers((prev) => 
      prev.map(v => v._id === volunteerId ? { ...v, status: 'approved' } : v)
    );
    api.put(`/volunteers/${volunteerId}/approve`).catch(() => {});
  };

  const handleDeleteVolunteer = (volunteerId) => {
    if (!window.confirm('Are you sure you want to permanently delete this volunteer?')) return;
    
    setVolunteers((prev) => prev.filter((v) => v._id !== volunteerId));
    api.delete(`/volunteers/${volunteerId}`).catch((err) => {
        setError(err.response?.data?.message || 'Delete failed. Restoring data...');
        loadData(); // Reload if it fails
    });
  };

  const handleBulkUpload = (data) => {
    setLoading(true);
    api
      .post('/volunteers/bulk', { data })
      .then(() => {
        setIsUploadingCsv(false);
        loadData();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Bulk upload failed.');
        setLoading(false);
      });
  };

  return (
    <section className="space-y-5 pb-10 md:space-y-6">
      <PageHeader
        title="Volunteers"
        subtitle="Search, discover, and coordinate your field volunteer network"
        action={
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsUploadingCsv(true)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-hover)]"
              >
                <FileUp className="h-4 w-4" />
                Upload CSV
              </button>
            )}
            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
            >
              Refresh
            </button>
          </div>
        }
      />

      <StaggerSection className="glass rounded-xl p-4">
        <div className="grid gap-2 md:grid-cols-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skills, or location"
            className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none placeholder:text-[var(--text-muted)] md:col-span-2"
          />
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
          >
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
          >
            {allLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
          <AnimatedButton onClick={loadData} className="h-11 w-full justify-center">
            {loading ? 'Searching...' : 'Search'}
          </AnimatedButton>
        </div>
      </StaggerSection>

      {error ? <div className="mb-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonLoader className="h-44 w-full" />
          <SkeletonLoader className="h-44 w-full" />
          <SkeletonLoader className="h-44 w-full" />
        </div>
      ) : null}

      {!loading && filteredVolunteers.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center text-sm text-[var(--text-secondary)]">No volunteers available yet</div>
      ) : null}

      {!loading ? <StaggerSection className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredVolunteers.map((v) => (
          <StaggerItem key={v._id}>
          <motion.article
            whileHover={{ y: -4 }}
            className="tilt-card glass rounded-xl p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={v.profileImage}
                alt={v.name}
                className="h-12 w-12 rounded-full border border-[var(--border-muted)] bg-[var(--card-elevated)] object-cover"
              />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{v.name}</p>
                <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <MapPin className="h-3 w-3" />
                  {v.location || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="mb-1 text-sm text-[var(--text-secondary)]">Skills: {(v.skills || []).join(', ') || 'N/A'}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${(v.status || '').toLowerCase() === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {v.status || 'approved'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Events Joined: {v.eventsJoined || 0}</p>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-1 text-cyan-200">
                <Users className="mr-1 inline h-3 w-3" />
                {v.hoursWorked || 0} hrs
              </span>
              <span className="rounded-full border border-amber-300/25 bg-amber-500/10 px-2 py-1 text-amber-200">
                <Sparkles className="mr-1 inline h-3 w-3" />
                {v.impactScore || 0} impact
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => navigate(`/volunteers/${v._id}`)}
                className="rounded-lg border border-[var(--border-muted)] px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Profile
              </button>
              
              {user?.role === 'admin' && (v.status || '').toLowerCase() === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleApprove(v._id)}
                  className="rounded-lg border border-emerald-500/50 bg-emerald-600/20 px-3 py-1.5 text-emerald-300 hover:bg-emerald-600/40"
                >
                  Approve
                </button>
              )}

              {user?.role === 'admin' && (v.status || '').toLowerCase() !== 'pending' && (
                <button
                  type="button"
                  onClick={() => openAssignModal(v)}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-white"
                >
                  Assign Event
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleDeleteVolunteer(v._id)}
                  className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              )}
            </div>
          </motion.article>
          </StaggerItem>
        ))}
      </StaggerSection> : null}

      {assigningVolunteer ? (
        <>
          <button
            type="button"
            aria-label="Close assign event modal"
            onClick={() => setAssigningVolunteer(null)}
            className="fixed inset-0 z-40 bg-slate-950/50"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-elevated)] p-5">
            <h3 className="font-['Outfit'] text-lg font-semibold">Assign Event</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Assigning {assigningVolunteer.name} to an event</p>

            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="mt-4 w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
            >
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title || event.name} | {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningVolunteer(null)}
                className="rounded-xl border border-[var(--border-muted)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <AnimatedButton onClick={assignEvent} disabled={submitting || !selectedEventId}>
                {submitting ? 'Assigning...' : 'Assign'}
              </AnimatedButton>
            </div>
          </div>
        </>
      ) : null}

      {isUploadingCsv && (
        <CsvUploader
          title="Upload Volunteers"
          onUpload={handleBulkUpload}
          onCancel={() => setIsUploadingCsv(false)}
        />
      )}
    </section>
  );
};

export default VolunteersPage;

