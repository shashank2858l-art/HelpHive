import { TABLES } from '../models/tableNames.js';
import { deleteRow, getById, insertRow, listRows, updateRow } from '../services/dataService.js';

const assignCoords = () => ({
  lat: (12.9716 + (Math.random() - 0.5) * 5).toFixed(4),
  lng: (77.5946 + (Math.random() - 0.5) * 5).toFixed(4)
});

const encodeLocation = (location, req) => {
    const coords = assignCoords();
    const uid = req.user?.id || 'none';
    return `${location || 'Unknown'}||${uid}||${coords.lat}||${coords.lng}`;
};

const decodeRows = (rows) => {
    return rows.map(r => {
        const parts = (r.location || '').split('||');
        if (parts.length === 4) {
            return { ...r, location: parts[0], coordinates: { ownerId: parts[1], lat: parseFloat(parts[2]), lng: parseFloat(parts[3]) } };
        }
        // Fallback for legacy locations or missing data
        const coords = assignCoords();
        return { ...r, coordinates: { ownerId: 'none', lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) } };
    });
};

export const getEvents = async (req, res) => {
  let events = await listRows(TABLES.events);
  events = decodeRows(events);

  const isGlobalAdmin = req.user?.role === 'admin';
  // Allow everyone to see seeded events (null owner) and their own events. Admins see everything.
  events = events.filter(e => isGlobalAdmin || !e.coordinates?.ownerId || e.coordinates.ownerId === 'none' || e.coordinates.ownerId === req.user?.id);

  const { status } = req.query;

  if (!status) {
    return res.json(events);
  }

  return res.json(events.filter((item) => String(item.status || '').toLowerCase() === String(status).toLowerCase()));
};

export const createEvent = async (req, res) => {
  const event = await insertRow(TABLES.events, {
    ...req.body,
    assignedVolunteers: req.body.assignedVolunteers || [],
    status: req.body.status || 'planned',
    location: encodeLocation(req.body.location, req),
  });
  return res.status(201).json(decodeRows([event])[0]);
};

export const deleteEvent = async (req, res) => {
  await deleteRow(TABLES.events, req.params.id);
  return res.status(204).send();
};

export const bulkCreateEvent = async (req, res) => {
  const eventsArray = Array.isArray(req.body) ? req.body : req.body.data;
  if (!eventsArray || !eventsArray.length) {
    return res.status(400).json({ message: 'Missing data array' });
  }

  const mapped = eventsArray.map((e) => ({
    title: e.title || e.name || 'Unnamed Event',
    description: e.description || '',
    location: encodeLocation(e.location, req),
    date: e.date || new Date().toISOString(),
    volunteersRequired: Number(e.volunteersRequired) || 0,
    status: e.status || 'planned',
  }));

  const events = await insertRows(TABLES.events, mapped);
  return res.status(201).json(decodeRows(events));
};

const resolveVolunteerId = (req) => req.user?.id || req.body.userId || req.body.volunteerId;

export const joinEvent = async (req, res) => {
  const event = await getById(TABLES.events, req.params.id || req.body.eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const volunteerId = resolveVolunteerId(req);
  const assigned = new Set(event.assignedVolunteers || []);
  if (volunteerId) assigned.add(volunteerId);

  const updated = await updateRow(TABLES.events, event.id, {
    assignedVolunteers: Array.from(assigned),
  });

  return res.json(updated);
};

export const assignVolunteers = async (req, res) => {
  const event = await getById(TABLES.events, req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const assigned = new Set(event.assignedVolunteers || []);
  (req.body.volunteerIds || []).forEach((id) => assigned.add(id));

  const updated = await updateRow(TABLES.events, event.id, {
    assignedVolunteers: Array.from(assigned),
  });

  return res.json(updated);
};
