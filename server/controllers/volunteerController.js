import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { TABLES } from '../models/tableNames.js';
import { deleteRow, getById, insertRow, insertRows, listRows, updateRow } from '../services/dataService.js';

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
        return { ...r, coordinates: { ownerId: null } };
    });
};

export const getVolunteers = async (req, res) => {
  let volunteers = await listRows(TABLES.volunteers);
  volunteers = decodeRows(volunteers);
  
  // Isolate by tenant
  const isGlobalAdmin = req.user?.role === 'admin';
  let filtered = volunteers.filter(v => isGlobalAdmin || !v.coordinates?.ownerId || v.coordinates.ownerId === req.user?.id);

  const { status, search, availability } = req.query;

  if (status) {
    filtered = filtered.filter((item) => String(item.status || '').toLowerCase() === String(status).toLowerCase());
  }

  if (availability !== undefined) {
    const available = availability === 'true';
    filtered = filtered.filter((item) => Boolean(item.available ?? true) === available);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((item) =>
      [item.name, item.location, ...(item.skills || [])].join(' ').toLowerCase().includes(q)
    );
  }

  return res.json(filtered);
};

export const createVolunteer = async (req, res) => {
  const randomPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 10);
  
  const user = await insertRow(TABLES.users, {
    fullName: req.body.name || req.body.fullName || 'Unknown',
    email: req.body.email || `${crypto.randomBytes(4).toString('hex')}@demo.com`,
    passwordHash,
    role: req.body.role || 'volunteer',
    phone: req.body.phone || '',
    location: req.body.location || '',
    skills: req.body.skills || [],
  });

  const volunteer = await insertRow(TABLES.volunteers, {
    id: user.id,
    ...req.body,
    status: req.body.status || 'pending',
    skills: req.body.skills || [],
    eventsJoined: 0,
    hoursWorked: 0,
    impactScore: 0,
    location: encodeLocation(req.body.location, req),
  });

  if (req.io) req.io.emit('system:event', { message: 'New volunteer registered', eventName: 'volunteer_added', id: Date.now().toString() });

  return res.status(201).json(decodeRows([volunteer])[0]);
};

export const bulkCreateVolunteer = async (req, res) => {
  const volsArray = Array.isArray(req.body) ? req.body : req.body.data;
  if (!volsArray || !volsArray.length) {
    return res.status(400).json({ message: 'Missing data array' });
  }

  const userPayloads = await Promise.all(volsArray.map(async (v) => {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    return {
      fullName: v.name || v.fullName || 'Unknown',
      email: (v.email || `${crypto.randomBytes(4).toString('hex')}@demo.com`).toLowerCase(),
      passwordHash,
      role: v.role || 'volunteer',
      phone: v.phone || '',
      location: v.location || '',
      skills: typeof v.skills === 'string' ? v.skills.split(',').map(s => s.trim()) : (v.skills || []),
    };
  }));

  const createdUsers = await insertRows(TABLES.users, userPayloads);

  const mapped = volsArray.map((v, index) => {
    // Attempt to match by index, fallback to a matched email
    const fallbackEmail = (v.email || '').toLowerCase();
    const matchedUser = createdUsers[index] || createdUsers.find(u => u.email === fallbackEmail) || { id: crypto.randomUUID() };

    return {
      id: matchedUser.id,
      name: v.name || v.fullName || 'Unknown',
      email: v.email || `${crypto.randomBytes(4).toString('hex')}@demo.com`,
      role: v.role || 'volunteer',
      status: v.status || 'pending',
      skills: typeof v.skills === 'string' ? v.skills.split(',').map(s => s.trim()) : (v.skills || []),
      eventsJoined: 0,
      hoursWorked: 0,
      impactScore: 0,
      location: encodeLocation(v.location, req),
    };
  });

  const volunteers = await insertRows(TABLES.volunteers, mapped);
  if (req.io) req.io.emit('system:event', { message: `${volunteers.length} new volunteers registered`, eventName: 'volunteer_added', id: Date.now().toString() });
  return res.status(201).json(decodeRows(volunteers));
};

export const getVolunteerById = async (req, res) => {
  const volunteer = await getById(TABLES.volunteers, req.params.id);
  if (!volunteer) {
    return res.status(404).json({ message: 'Volunteer not found' });
  }

  return res.json(decodeRows([volunteer])[0]);
};

export const updateVolunteer = async (req, res) => {
  const volunteer = await updateRow(TABLES.volunteers, req.params.id, req.body);
  return res.json(decodeRows([volunteer])[0]);
};

export const approveVolunteer = async (req, res) => {
  const volunteer = await updateRow(TABLES.volunteers, req.params.id, { status: 'approved' });
  return res.json(decodeRows([volunteer])[0]);
};

export const deleteVolunteer = async (req, res) => {
  const volunteerId = req.params.id;
  // Delete from volunteers table
  await deleteRow(TABLES.volunteers, volunteerId);
  // Also delete from users table (since they share the same ID)
  try {
    await deleteRow(TABLES.users, volunteerId);
  } catch (err) {
    console.warn('User record delete skipped or failed:', err.message);
  }
  return res.status(204).send();
};
