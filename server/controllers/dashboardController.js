import { TABLES } from '../models/tableNames.js';
import { listRows } from '../services/dataService.js';

const monthName = (dateValue) =>
  new Date(dateValue).toLocaleString('en-US', {
    month: 'short',
  });

const decodeRows = (rows) => {
    return rows.map(r => {
        const parts = (r.location || '').split('||');
        if (parts.length === 4) {
            return { ...r, location: parts[0], coordinates: { ownerId: parts[1], lat: parseFloat(parts[2]), lng: parseFloat(parts[3]) } };
        }
        return { ...r, coordinates: { ownerId: null } };
    });
};

export const getOverview = async (req, res) => {

  let [volunteers, events, resources, activities] = await Promise.all([
    listRows(TABLES.volunteers),
    listRows(TABLES.events),
    listRows(TABLES.resources),
    listRows(TABLES.volunteerActivity),
  ]);

  volunteers = decodeRows(volunteers);
  events = decodeRows(events);
  resources = decodeRows(resources);
  activities = decodeRows(activities);

  const uid = req.user?.id;
  if (uid) {
    volunteers = volunteers.filter(x => !x.coordinates?.ownerId || x.coordinates.ownerId === uid);
    events = events.filter(x => !x.coordinates?.ownerId || x.coordinates.ownerId === uid);
    resources = resources.filter(x => !x.coordinates?.ownerId || x.coordinates.ownerId === uid);
    activities = activities.filter(x => !x.coordinates?.ownerId || x.coordinates.ownerId === uid);
  }

  const metrics = {
    totalVolunteers: volunteers.length,
    activeEvents: events.filter((event) => ['active', 'planned'].includes(String(event.status || '').toLowerCase())).length,
    availableResources: resources.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    volunteerHours: activities.reduce((sum, item) => sum + Number(item.hoursContributed || 0), 0),
  };

  const leaderboard = [...volunteers]
    .sort((a, b) => Number(b.impactScore || 0) - Number(a.impactScore || 0))
    .slice(0, 10)
    .map((row, index) => ({
      _id: row.id,
      volunteerId: row.id,
      name: row.name,
      rank: index + 1,
      points: Number(row.impactScore || 0),
      hoursWorked: Number(row.hoursWorked || 0),
    }));

  const activityByMonth = activities.reduce((acc, item) => {
    const key = monthName(item.created_at || item.timestamp || Date.now());
    acc[key] = acc[key] || { name: key, volunteers: 0 };
    acc[key].volunteers += 1;
    return acc;
  }, {});

  const eventSeries = events.slice(0, 8).map((event) => ({
    name: event.title || event.name,
    participants: (event.assignedVolunteers || []).length,
    target: Math.max(1, Number(event.volunteersRequired || 0)),
  }));

  const resourceSeries = resources.slice(0, 8).map((resource) => ({
    name: resource.resourceName || resource.name,
    quantity: Number(resource.quantity || 0),
  }));

  return res.json({
    metrics,
    leaderboard,
    recentEvents: events.slice(0, 5),
    activitySeries: Object.values(activityByMonth),
    resourceSeries,
    eventSeries,
  });
};

export const getVolunteerDashboard = async (req, res) => {
  const userId = req.user?.id;
  let [volunteers, events, tasks, notifications, disasters, activity] = await Promise.all([
    listRows(TABLES.volunteers),
    listRows(TABLES.events),
    listRows(TABLES.tasks),
    listRows(TABLES.notifications),
    listRows(TABLES.disasters),
    listRows(TABLES.volunteerActivity),
  ]);

  volunteers = decodeRows(volunteers);
  events = decodeRows(events);

  const profile = volunteers.find((v) => v.id === userId) || volunteers[0] || null;
  const joinedEvents = events.filter((event) => (event.assignedVolunteers || []).includes(profile?.id));
  const nearbyEvents = events.filter((event) => !joinedEvents.some((joined) => joined.id === event.id));

  return res.json({
    profile,
    nearbyEvents: nearbyEvents.slice(0, 8),
    joinedEvents: joinedEvents.slice(0, 8),
    tasks: tasks.filter((task) => task.assignedVolunteer === profile?.id).slice(0, 10),
    activity: activity.filter((item) => item.volunteerId === profile?.id).slice(0, 10),
    notifications: notifications.filter((item) => item.userId === profile?.id).slice(0, 8),
    disasters: disasters.slice(0, 10),
    metrics: {
      upcomingEvents: nearbyEvents.length,
    },
  });
};
