import { motion } from 'framer-motion';
import {
  Activity,
  CalendarClock,
  Compass,
  MapPinned,
  PackageCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import ResourceBarChart from '../components/charts/ResourceBarChart';
import VolunteerLineChart from '../components/charts/VolunteerLineChart';
import MapContainer from '../components/MapContainer';
import SkeletonLoader from '../components/loader/SkeletonLoader';
import PageHeader from '../components/ui/PageHeader';
import { StaggerSection } from '../components/ui/StaggerSection';
import StatCard from '../components/ui/StatCard';
import { useSocket } from '../hooks/useSocket';
import { api } from '../services/api';

const emptyOverview = {
  metrics: {
    totalVolunteers: 0,
    activeEvents: 0,
    availableResources: 0,
    volunteerHours: 0,
  },
  activitySeries: [],
  resourceSeries: [],
  eventSeries: [],
  recentEvents: [],
  leaderboard: [],
};

const DashboardPage = () => {
  const [overview, setOverview] = useState(emptyOverview);
  const [recommendations, setRecommendations] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [openHelpRequests, setOpenHelpRequests] = useState(0);
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { connected, liveEvents } = useSocket();

  useEffect(() => {
    Promise.allSettled([
      api.get('/dashboard/overview'),
      api.get('/activity'),
      api.get('/help-requests?status=open'),
      api.post('/ai/recommend-volunteers', {}),
      api.get('/disaster'),
      api.get('/volunteers'),
      api.get('/events'),
      api.get('/resources'),
    ])
      .then(([
        overviewRes,
        activityRes,
        helpReqRes,
        recommendationRes,
        disastersRes,
        volunteersRes,
        eventsRes,
        resourcesRes,
      ]) => {
        if (overviewRes.status !== 'fulfilled') {
          throw overviewRes.reason;
        }

        if (activityRes.status !== 'fulfilled') {
          throw activityRes.reason;
        }

        if (helpReqRes.status !== 'fulfilled') {
          throw helpReqRes.reason;
        }

        setOverview({ ...emptyOverview, ...(overviewRes.value.data || {}) });
        setFeed(
          (activityRes.value.data || []).slice(0, 8).map((item) => ({
            id: item._id,
            title: item.eventId?.title
              ? `Worked on ${item.eventId.title}`
              : `Logged ${item.hoursContributed || 0} volunteer hours`,
            time: new Date(item.timestamp).toLocaleString(),
            type: 'activity',
          }))
        );
        setOpenHelpRequests(
          Array.isArray(helpReqRes.value.data) ? helpReqRes.value.data.length : 0
        );
        setRecommendations(
          recommendationRes.status === 'fulfilled'
            ? recommendationRes.value.data?.recommendations || []
            : []
        );
        setDisasters(
          disastersRes.status === 'fulfilled' && Array.isArray(disastersRes.value.data)
            ? disastersRes.value.data
            : []
        );

        const volunteers =
          volunteersRes.status === 'fulfilled' && Array.isArray(volunteersRes.value.data)
            ? volunteersRes.value.data
            : [];
        const events =
          eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)
            ? eventsRes.value.data
            : [];
        const resources =
          resourcesRes.status === 'fulfilled' && Array.isArray(resourcesRes.value.data)
            ? resourcesRes.value.data
            : [];
        const helpRequests = Array.isArray(helpReqRes.value.data) ? helpReqRes.value.data : [];
        const alerts =
          disastersRes.status === 'fulfilled' && Array.isArray(disastersRes.value.data)
            ? disastersRes.value.data
            : [];

        const previewPoints = [
          ...volunteers.map((volunteer) => ({
            name: volunteer.name,
            label: `Volunteer | ${volunteer.location || 'Unknown'}`,
            lat: volunteer.coordinates?.lat,
            lng: volunteer.coordinates?.lng,
            type: 'volunteer',
          })),
          ...events.map((event) => ({
            name: event.title || event.name,
            label: `Event | ${event.location || 'Unknown'}`,
            lat: event.coordinates?.lat,
            lng: event.coordinates?.lng,
            type: 'event',
          })),
          ...resources.map((resource) => ({
            name: resource.resourceName || resource.name,
            label: `Resource | ${resource.location || 'Unknown'}`,
            lat: resource.coordinates?.lat,
            lng: resource.coordinates?.lng,
            type: 'resource',
          })),
          ...helpRequests.map((request) => ({
            name: request.title || 'Help Request',
            label: `Help | ${request.location || request.urgency || 'Open'}`,
            lat: request.coordinates?.lat,
            lng: request.coordinates?.lng,
            type: 'help',
          })),
          ...alerts.map((alert) => ({
            name: alert.type || 'Disaster Alert',
            label: `Disaster | ${alert.location || 'Unknown'}`,
            lat: alert.coordinates?.lat,
            lng: alert.coordinates?.lng,
            type: 'help',
          })),
        ]
          .filter((point) => point.lat && point.lng)
          .slice(0, 24);

        setMapPoints(previewPoints);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
        setOverview(emptyOverview);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!liveEvents.length) return;

    const incoming = liveEvents[0];

    // Auto-refresh Dashboard charts upon CSV Resource/Volunteer uploads
    if (['resource_added', 'volunteer_added'].includes(incoming.eventName)) {
      api.get('/dashboard/overview').then((res) => {
        if (res.data) setOverview(prev => ({ ...prev, ...res.data }));
      }).catch(console.error);
    }

    setFeed((prev) => {
      if (prev[0]?.id === incoming.id) return prev;

      return [
        {
          id: incoming.id,
          title: incoming.message,
          time: 'Just now',
          type: incoming.eventName,
        },
        ...prev,
      ].slice(0, 8);
    });
  }, [liveEvents]);

  const topVolunteers = useMemo(() => (overview.leaderboard || []).slice(0, 5), [overview.leaderboard]);

  if (loading) {
    return (
      <section className="space-y-4 pb-8">
        <SkeletonLoader className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonLoader className="h-36 w-full" />
          <SkeletonLoader className="h-36 w-full" />
          <SkeletonLoader className="h-36 w-full" />
          <SkeletonLoader className="h-36 w-full" />
        </div>
        <SkeletonLoader className="h-80 w-full" />
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-10 md:space-y-6">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div className="particle-bg rounded-3xl border border-[var(--border-muted)] bg-[var(--surface-soft)]/80 p-5 md:p-6">
        <PageHeader
          title="HelpHive Dashboard"
          subtitle="Smart Volunteer and Resource Coordination Platform"
          action={
            <div
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                connected
                  ? 'border border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                  : 'border border-amber-400/35 bg-amber-500/10 text-amber-200'
              }`}
            >
              {connected ? 'Live Sync Connected' : 'Live Sync Reconnecting'}
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Volunteers"
            value={overview.metrics.totalVolunteers}
            icon={Users}
            colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
          />
          <StatCard
            title="Active Events"
            value={overview.metrics.activeEvents}
            icon={CalendarClock}
            colorClass="bg-gradient-to-br from-indigo-500 to-sky-600"
          />
          <StatCard
            title="Available Resources"
            value={overview.metrics.availableResources}
            icon={PackageCheck}
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Volunteer Hours"
            value={overview.metrics.volunteerHours}
            icon={Activity}
            colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>
      </div>

      <StaggerSection className="grid gap-4 xl:grid-cols-2">
        <VolunteerLineChart data={overview.activitySeries} />
        <ResourceBarChart data={overview.resourceSeries} />
      </StaggerSection>

      <StaggerSection className="glass rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-['Outfit'] text-lg font-semibold">Disaster Monitoring</h3>
          <span className="rounded-full border border-[var(--border-muted)] bg-[var(--card-elevated)] px-2 py-1 text-xs text-[var(--text-muted)]">
            {disasters.length} alerts
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {disasters.slice(0, 6).map((alert) => (
            <article
              key={alert._id}
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-3"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {alert.type || 'Disaster Alert'}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Location: {alert.location || 'N/A'}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Severity: {alert.severity || 'medium'}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Assigned volunteers: {(overview.metrics.totalVolunteers || 0) > 0 ? 'Available pool active' : 'None yet'}
              </p>
            </article>
          ))}
          {!disasters.length ? (
            <p className="text-sm text-[var(--text-secondary)]">No active disaster alerts found.</p>
          ) : null}
        </div>
      </StaggerSection>

      <StaggerSection className="grid gap-4 xl:grid-cols-5">
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 xl:col-span-3"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-300" />
            <h3 className="font-['Outfit'] text-lg font-semibold">Event Participation</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.eventSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.22)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--border-muted)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="participants" fill="var(--primary)" radius={[8, 8, 0, 0]} animationDuration={900} />
                <Bar dataKey="target" fill="var(--secondary)" radius={[8, 8, 0, 0]} animationDuration={1100} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <article className="glass rounded-xl p-4 xl:col-span-2">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Recent Events</h3>
          <div className="space-y-2.5">
            {overview.recentEvents.slice(0, 4).map((event) => (
              <div key={event._id} className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{event.title || event.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  {new Date(event.date).toLocaleDateString()} | {event.location}
                </p>
              </div>
            ))}
            {!overview.recentEvents.length ? (
              <p className="text-sm text-[var(--text-secondary)]">No recent events found.</p>
            ) : null}
          </div>
        </article>
      </StaggerSection>

      <StaggerSection className="grid gap-4 xl:grid-cols-3">
        <article className="glass rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-300" />
            <h3 className="font-semibold">Volunteer Leaderboard</h3>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            {topVolunteers.map((volunteer, index) => (
              <div key={volunteer._id}>
                <div className="mb-1 flex items-center justify-between">
                  <span>
                    #{index + 1} {volunteer.name || volunteer.fullName}
                  </span>
                  <span>{volunteer.impactScore || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700/45">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${volunteer.impactScore || 0}%` }}
                    transition={{ duration: 0.6, delay: index * 0.06 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  />
                </div>
              </div>
            ))}
            {!topVolunteers.length ? <p>No volunteer activity yet.</p> : null}
          </div>
        </article>

        <article className="glass rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-sky-300" />
            <h3 className="font-semibold">Live Map Preview</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{openHelpRequests} active help markers near operations.</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border-muted)]">
            <MapContainer points={mapPoints} heightClass="h-48" />
          </div>
          <Link
            to="/map-tracking"
            className="mt-3 inline-flex items-center gap-1 rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
          >
            <Compass className="h-3.5 w-3.5" />
            Open full map tracking
          </Link>
        </article>

        <article className="glass rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <h3 className="font-semibold">AI Insights Panel</h3>
          </div>
          <p className="mb-3 text-sm text-[var(--text-secondary)]">Recommendations are generated from current volunteer skills and impact data.</p>
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3 text-sm">
            <p className="mb-2 font-semibold text-cyan-100">AI Suggestion: Top volunteer matches</p>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              {recommendations.slice(0, 4).map((row) => (
                <li key={row.volunteerId || row.name}>
                  {(row.name || row.volunteerName || 'Volunteer')} - {row.reason || 'Recommended by ranking model'}
                </li>
              ))}
            </ul>
            {!recommendations.length ? (
              <p className="text-[var(--text-secondary)]">No recommendation data available.</p>
            ) : null}
          </div>
        </article>
      </StaggerSection>

      <StaggerSection className="grid gap-4 xl:grid-cols-5">
        <article className="glass rounded-xl p-4 xl:col-span-3">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Resource Usage Graph</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.resourceSeries}>
                <defs>
                  <linearGradient id="resourceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.22)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--border-muted)',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="quantity"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#resourceFill)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass rounded-xl p-4 xl:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <TimerReset className="h-4 w-4 text-amber-300" />
            <h3 className="font-semibold">Live Activity Feed</h3>
          </div>
          <div className="space-y-2.5">
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2"
              >
                <p className="text-sm text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">{item.time}</p>
              </motion.div>
            ))}
          </div>
        </article>
      </StaggerSection>
    </section>
  );
};

export default DashboardPage;
