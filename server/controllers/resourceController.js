import crypto from 'crypto';
import { TABLES } from '../models/tableNames.js';
import { deleteRow, insertRow, insertRows, listRows, updateRow } from '../services/dataService.js';

// Helper to assign random coords for map demonstrations
const assignCoords = () => {
  return {
    lat: (12.9716 + (Math.random() - 0.5) * 5).toFixed(4), // Bangalore-ish anchor
    lng: (77.5946 + (Math.random() - 0.5) * 5).toFixed(4)
  };
};

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

export const getResources = async (req, res) => {
  let resources = await listRows(TABLES.resources);
  resources = decodeRows(resources).map(r => ({ ...r, category: r.category || 'General' }));
  // Isolate by tenant
  const isGlobalAdmin = req.user?.role === 'admin';
  const filtered = resources.filter(r => isGlobalAdmin || !r.coordinates?.ownerId || r.coordinates.ownerId === req.user?.id || r.coordinates.ownerId === 'none');
  return res.json(filtered);
};

export const createResource = async (req, res) => {
  const { resourceName, name, ...rest } = req.body;
  const determinedName = resourceName || name || 'Unnamed';
  const resource = await insertRow(TABLES.resources, {
    ...rest,
    name: determinedName,
    category: req.body.category || 'General',
    status: req.body.status || 'available',
    location: encodeLocation(req.body.location, req),
  });
  if (req.io) req.io.emit('system:event', { message: 'New resource added to inventory', eventName: 'resource_added', id: Date.now().toString() });
  return res.status(201).json(decodeRows([resource])[0]);
};

export const bulkCreateResource = async (req, res) => {
  const resourcesArray = Array.isArray(req.body) ? req.body : req.body.data;
  if (!resourcesArray || !resourcesArray.length) {
    return res.status(400).json({ message: 'Missing data array' });
  }

  const mapped = resourcesArray.map((r) => {
    const determinedName = r.resourceName || r.name || 'Unnamed';
    return {
      name: determinedName,
      category: r.category || 'General',
      quantity: Number(r.quantity) || 0,
      status: r.status || 'available',
      location: encodeLocation(r.location, req),
    };
  });

  const resources = await insertRows(TABLES.resources, mapped);
  if (req.io) req.io.emit('system:event', { message: `${resources.length} new resources added to inventory`, eventName: 'resource_added', id: Date.now().toString() });
  return res.status(201).json(decodeRows(resources));
};

export const updateResource = async (req, res) => {
  const resource = await updateRow(TABLES.resources, req.params.id, req.body);
  return res.json(decodeRows([resource])[0]);
};

export const deleteResource = async (req, res) => {
  await deleteRow(TABLES.resources, req.params.id);
  return res.status(204).send();
};
