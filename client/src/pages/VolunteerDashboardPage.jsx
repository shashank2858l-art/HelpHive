import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  CalendarClock,
  Compass,
  Crown,
  MapPinned,
  Medal,
  Sparkles,
  Trophy,
  UserCircle2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import PageHeader from '../components/ui/PageHeader';
import SkeletonLoader from '../components/loader/SkeletonLoader';
import StatCard from '../components/ui/StatCard';
import { StaggerItem, StaggerSection } from '../components/ui/StaggerSection';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const VolunteerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [aiInsights, setAiInsights] = useState({
    success: false,
    insight:
      'Assign volunteers with medical skills to flood zones. Deploy logistics volunteers to supply centers. Monitor volunteer availability in nearby areas.',
    fallbackRecommendations: [
      'Assign volunteers with medical skills to flood zones.',
      'Deploy logistics volunteers to supply centers.',
      'Monitor volunteer availability in nearby areas.',
    ],
    suggestedEvents: [],
    bestVolunteerRoles: [],
    disasterAlerts: [],
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [openHelpRequests, setOpenHelpRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    if (!user?._id && !user?.id) return;

    setLoading(true);
    setAiLoading(true);

    Promise.all([
      api.get('/volunteer/dashboard'),
      api.get('/leaderboard'),
      api.get('/volunteer-activity'),
      api.get('/events'),
      api.get('/help-requests?status=open'),
    ])
      .then(([dashboardRes, leaderboardRes, activityRes, eventsRes, helpReqRes]) => {
        const dashboard = dashboardRes.data || {};
        setProfile(dashboard.profile || null);
        setNearbyEvents(Array.isArray(dashboard.nearbyEvents) ? dashboard.nearbyEvents : []);
        setJoinedEvents(Array.isArray(dashboard.joinedEvents) ? dashboard.joinedEvents : []);
        setTasks(Array.isArray(dashboard.tasks) ? dashboard.tasks : []);
        setTimeline(Array.isArray(activityRes.data) ? activityRes.data : dashboard.activity || []);
        setNotifications(Array.isArray(dashboard.notifications) ? dashboard.notifications : []);
        setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
        setUpcomingEvents(dashboard.metrics?.upcomingEvents || 0);

        const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];
        const disasterPoints = (dashboard.disasters || []).map((alert) => ({
          name: alert.type || 'Disaster Alert',
          label: `Alert | ${alert.location || 'Unknown'}`,
          lat: alert.coordinates?.lat,
          lng: alert.coordinates?.lng,
          type: 'help',
        }));
        const eventPoints = events.map((event) => ({
          name: event.title || event.name,
          label: `Event | ${event.location || 'Unknown'}`,
          lat: event.coordinates?.lat,
          lng: event.coordinates?.lng,
          type: 'event',
        }));
        const volunteerPoint = dashboard.profile
          ? [
              {
                name: dashboard.profile.name,
                label: `You | ${dashboard.profile.location || 'Unknown'}`,
                lat: dashboard.profile.coordinates?.lat,
                lng: dashboard.profile.coordinates?.lng,
                type: 'volunteer',
              },
            ]
          : [];

        setMapPoints([...volunteerPoint, ...eventPoints, ...disasterPoints].filter((p) => p.lat && p.lng).slice(0, 30));
        setOpenHelpRequests(Array.isArray(helpReqRes.data) ? helpReqRes.data.length : 0);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load volunteer dashboard.');
      })
      .finally(() => setLoading(false));

    api
      .post('/ai-insights', {})
      .then((aiRes) => {
        const data = aiRes.data || {};
        setAiInsights((prev) => ({
          ...prev,
          ...data,
          fallbackRecommendations:
            Array.isArray(data.fallbackRecommendations) && data.fallbackRecommendations.length
              ? data.fallbackRecommendations
              : prev.fallbackRecommendations,
        }));
      })
      .catch(() => {
        setAiInsights((prev) => ({
          ...prev,
          success: false,
        }));
      })
      .finally(() => setAiLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, [user?._id, user?.id]);

  const topVolunteers = useMemo(() => leaderboard.slice(0, 8), [leaderboard]);

  const rankRowClass = (rank) => {
    if (rank === 1) return 'border-amber-400/40 bg-amber-500/10';
    if (rank === 2) return 'border-slate-400/40 bg-slate-500/10';
    if (rank === 3) return 'border-orange-400/40 bg-orange-500/10';
    return 'border-[var(--border-muted)] bg-[var(--card-elevated)]';
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-amber-300" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-200" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-orange-300" />;
    return <span className="text-xs text-[var(--text-muted)]">#{rank}</span>;
  };

  const handleJoinEvent = (eventId) => {
    api
      .post('/events/join', { eventId })
      .then(() => loadDashboard())
      .catch((err) => setError(err.response?.data?.message || 'Unable to join event.'));
  };

  if (loading) {
    return (
      <section className="space-y-4 pb-8">
        <SkeletonLoader className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonLoader className="h-36 w-full" />
          <SkeletonLoader className="h-36 w-full" />
          <SkeletonLoader className="h-36 w-full" />
        </div>
        <SkeletonLoader className="h-72 w-full" />
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-12 md:space-y-6">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        className="particle-bg rounded-3xl border border-[var(--border-muted)] bg-[var(--surface-soft)]/80 p-5 md:p-6"
      >
        <PageHeader
          title="Volunteer Dashboard"
          subtitle="Your Impact and Activities"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-2"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-2 py-1">
                <UserCircle2 className="h-5 w-5" />
                <span className="text-xs font-medium">{profile?.name || user?.name || 'Volunteer'}</span>
              </div>
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Events Joined"
            value={profile?.eventsJoined || 0}
            icon={CalendarClock}
            colorClass="bg-gradient-to-br from-indigo-500 to-sky-600"
          />
          <StatCard
            title="Volunteer Hours"
            value={profile?.hoursWorked || profile?.hoursContributed || 0}
            icon={Activity}
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Impact Score"
            value={profile?.impactScore || 0}
            icon={Trophy}
            colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents}
            icon={CalendarClock}
            colorClass="bg-gradient-to-br from-cyan-500 to-indigo-600"
          />
        </div>
      </motion.div>

      <StaggerSection className="grid gap-4 xl:grid-cols-3">
        <StaggerItem className="glass rounded-xl p-4 xl:col-span-2">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-300" />
            Available Events
          </h3>
          <div className="space-y-3">
            {nearbyEvents.slice(0, 5).map((event) => (
              <div key={event._id} className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{event.title || event.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {new Date(event.date).toLocaleDateString()} | {event.location}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Volunteers needed: {Math.max(0, (event.volunteersRequired || 0) - (event.assignedVolunteers?.length || 0))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleJoinEvent(event._id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition"
                  >
                    Join
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates?.lat || 12.9716},${event.coordinates?.lng || 77.5946}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--card-elevated)] hover:bg-[var(--surface-soft)] transition"
                    title="Open in Google Maps"
                  >
                    <MapPinned className="h-4 w-4 text-emerald-400" />
                  </a>
                  <Link
                    to="/events"
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-muted)] text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
            {!nearbyEvents.length ? (
              <p className="text-sm text-[var(--text-secondary)]">No available events right now.</p>
            ) : null}
          </div>
          
          <div className="mt-5 flex gap-3">
            <Link to="/events" className="flex-1 text-center py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition">
              Find More Events
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-cyan-300" />
            Map Tracking
          </h3>
          <MapContainer points={mapPoints} heightClass="h-80" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{openHelpRequests} open help requests near active operations.</p>
        </StaggerItem>
      </StaggerSection>

      <StaggerSection className="grid gap-4 xl:grid-cols-2">
        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-300" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {topVolunteers.map((row, index) => (
              <motion.div
                key={row.volunteerId || row._id}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.22, delay: index * 0.05 }}
                className={`grid grid-cols-4 items-center rounded-xl border px-3 py-2 text-sm ${rankRowClass(row.rank)}`}
              >
                <span className="flex items-center gap-1.5">{rankIcon(row.rank)}</span>
                <span className="truncate font-medium">{row.name}</span>
                <span>{row.hoursWorked ?? row.hoursContributed ?? 0}h</span>
                <span className="font-semibold">{row.impactScore || 0}</span>
              </motion.div>
            ))}
            {!topVolunteers.length ? <p className="text-sm text-[var(--text-secondary)]">No leaderboard data yet.</p> : null}
          </div>
        </StaggerItem>

        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            AI Insights
          </h3>
          {aiLoading ? (
            <div className="mb-3 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-3">
              <motion.p
                className="text-sm text-[var(--text-secondary)]"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Analyzing volunteer deployment...
              </motion.p>
            </div>
          ) : null}

          {!aiLoading ? (
            <div className="mb-3 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] p-3 text-sm text-[var(--text-secondary)]">
              <p>{aiInsights.insight}</p>
            </div>
          ) : null}

          {!aiLoading ? (
            <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
              {(aiInsights.fallbackRecommendations || []).slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Suggested Events</p>
              <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                {(aiInsights.suggestedEvents || []).slice(0, 3).map((event) => (
                  <li key={event.id}>{event.title} | {event.location}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Best Volunteer Roles</p>
              <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                {(aiInsights.bestVolunteerRoles || []).slice(0, 3).map((item, index) => (
                  <li key={`${item.volunteer}-${index}`}>{item.suggestedRole} | score {item.recommendationScore}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Disaster Alerts</p>
              <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                {(aiInsights.disasterAlerts || []).slice(0, 3).map((alert) => (
                  <li key={alert._id}>{alert.type} | {alert.location}</li>
                ))}
              </ul>
            </div>
          </div>
        </StaggerItem>
      </StaggerSection>

      <StaggerSection className="grid gap-4 xl:grid-cols-2">
        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-300" />
            Assigned Tasks
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm">
                <p className="font-medium text-[var(--text-primary)]">{task.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {task.eventId?.title || 'General'} | Status: {task.status}
                </p>
              </div>
            ))}
            {!tasks.length ? <p className="text-sm text-[var(--text-secondary)]">No assigned tasks yet.</p> : null}
          </div>
        </StaggerItem>

        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-300" />
            My Events
          </h3>
          <div className="space-y-2">
            {joinedEvents.length ? (
              joinedEvents.slice(0, 4).map((event) => (
                <div key={event._id} className="group rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm flex justify-between items-center transition-all hover:border-emerald-500/30">
                  <span className="truncate">{event.title || event.name} | {event.location}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates?.lat || 12.9716},${event.coordinates?.lng || 77.5946}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all ml-2"
                    title="Open in Google Maps"
                  >
                    <Compass className="h-4 w-4" />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Join an event to see it here.</p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-300" />
            Activity Timeline
          </h3>
          <div className="space-y-4 py-2">
            {timeline.slice(0, 8).map((activity, idx) => (
              <motion.div
                key={activity._id || idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.22, delay: idx * 0.05 }}
                className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[2px] before:bg-[var(--border-muted)] last:before:hidden"
              >
                <div className="timeline-dot-pulse absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-[var(--bg-base)] bg-cyan-500" />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {activity.eventId?.title
                    ? `Joined event: ${activity.eventId.title}`
                    : `Earned ${activity.impactScore || 0} impact points`}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
              </motion.div>
            ))}
            {!timeline.length ? (
              <p className="text-sm text-[var(--text-secondary)]">No activity logged yet.</p>
            ) : null}
          </div>
        </StaggerItem>
      </StaggerSection>

      <StaggerSection className="glass rounded-xl p-4">
        <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Notifications</h3>
        <div className="space-y-2">
          {notifications.slice(0, 4).map((notification) => (
            <div key={notification._id} className="rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm">
              <p className="text-[var(--text-primary)]">{notification.message}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
            </div>
          ))}
          {!notifications.length ? (
            <p className="text-sm text-[var(--text-secondary)]">No notifications yet.</p>
          ) : null}
        </div>
      </StaggerSection>
    </section>
  );
};

export default VolunteerDashboardPage;
