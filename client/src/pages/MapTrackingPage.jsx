import { useEffect, useMemo, useState } from 'react';
import { Compass, MapPin, Package, Users } from 'lucide-react';
import MapContainer from '../components/MapContainer';
import PageHeader from '../components/ui/PageHeader';
import { api } from '../services/api';

const MapTrackingPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [error, setError] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filters, setFilters] = useState({
    volunteer: true,
    event: true,
    resource: true,
    help: true,
  });

  useEffect(() => {
    Promise.all([api.get('/volunteers'), api.get('/events'), api.get('/resources'), api.get('/help-requests')])
      .then(([v, e, r, h]) => {
        setVolunteers(Array.isArray(v.data) ? v.data : []);
        setEvents(Array.isArray(e.data) ? e.data : []);
        setResources(Array.isArray(r.data) ? r.data : []);
        setHelpRequests(Array.isArray(h.data) ? h.data : []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load map data.'));
  }, []);

  const points = useMemo(() => {
    const volunteerPoints = volunteers.map((volunteer) => ({
      name: volunteer.name,
      label: `Volunteer | ${volunteer.location}`,
      lat: volunteer.coordinates?.lat,
      lng: volunteer.coordinates?.lng,
      type: 'volunteer',
    }));

    const eventPoints = events.map((event) => ({
      name: event.title || event.name,
      label: `Event | ${event.location}`,
      lat: event.coordinates?.lat,
      lng: event.coordinates?.lng,
      type: 'event',
    }));

    const centerPoints = resources.map((resource) => ({
      name: resource.resourceName || resource.name || 'Unnamed Resource',
      label: `Resource | ${resource.location || 'Unknown'}`,
      lat: resource.coordinates?.lat,
      lng: resource.coordinates?.lng,
      type: 'resource',
    }));

    const helpPoints = helpRequests.map((request) => ({
      name: request.title,
      label: `Help Request | ${request.urgency}`,
      lat: request.coordinates?.lat,
      lng: request.coordinates?.lng,
      type: 'help',
    }));

    return [...volunteerPoints, ...eventPoints, ...centerPoints, ...helpPoints]
      .filter((point) => point.lat && point.lng)
      .filter((point) => filters[point.type]);
  }, [events, filters, volunteers, resources, helpRequests]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section>
      <PageHeader
        title="Map Tracking"
        subtitle="Geospatial view of volunteers, events, and resource centers with marker filters"
      />
      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleFilter('volunteer')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${
            filters.volunteer
              ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200'
              : 'border-[var(--border-muted)] text-[var(--text-secondary)]'
          }`}
        >
          <Users className="mr-1 inline h-4 w-4" /> Volunteer locations
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('event')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${
            filters.event
              ? 'border-sky-400/45 bg-sky-500/10 text-sky-200'
              : 'border-[var(--border-muted)] text-[var(--text-secondary)]'
          }`}
        >
          <Compass className="mr-1 inline h-4 w-4" /> Event locations
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('resource')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${
            filters.resource
              ? 'border-amber-400/45 bg-amber-500/10 text-amber-200'
              : 'border-[var(--border-muted)] text-[var(--text-secondary)]'
          }`}
        >
          <Package className="mr-1 inline h-4 w-4" /> Resource centers
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('help')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${
            filters.help
              ? 'border-rose-400/45 bg-rose-500/10 text-rose-200'
              : 'border-[var(--border-muted)] text-[var(--text-secondary)]'
          }`}
        >
          <MapPin className="mr-1 inline h-4 w-4" /> Help requests
        </button>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <MapContainer points={points} onMarkerSelect={setSelectedPoint} />
        </div>
        <aside className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Nearby Operations</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <p>Nearby volunteers: {volunteers.length}</p>
            <p>Available resources: {resources.length}</p>
            <p>Active events: {events.length}</p>
            <p>Open help requests: {helpRequests.length}</p>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-3 text-sm">
            <p className="mb-1 font-semibold text-[var(--text-primary)]">Selected marker</p>
            {selectedPoint ? (
              <>
                <p className="text-[var(--text-primary)]">{selectedPoint.name}</p>
                <p className="text-[var(--text-secondary)]">{selectedPoint.label}</p>
              </>
            ) : (
              <p className="text-[var(--text-secondary)]">Click a map marker to see details.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="glass mt-4 flex flex-wrap gap-4 rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
        <span>Legend:</span>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Volunteer Marker
        </span>
        <span className="rounded-full bg-sky-500/20 px-3 py-1">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Event Marker
        </span>
        <span className="rounded-full bg-amber-500/20 px-3 py-1">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Resource Marker
        </span>
        <span className="rounded-full bg-rose-500/20 px-3 py-1">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Help Request Marker
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        OpenStreetMap is integrated with React Leaflet for live volunteer, event, resource, and help-request tracking.
      </div>
    </section>
  );
};

export default MapTrackingPage;
