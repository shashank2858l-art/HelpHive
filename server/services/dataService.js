import { TABLES } from '../models/tableNames.js';
import { supabase } from './supabaseClient.js';
import { randomUUID } from 'crypto';

const normalizeId = (row) => {
  if (!row) return row;
  return {
    ...row,
    _id: row._id || row.id,
  };
};

const withError = (error, fallback) => {
  if (!error) return fallback;
  throw new Error(error.message || 'Database operation failed');
};

export const listRows = async (table, { filters = {}, orderBy = null, ascending = false } = {}) => {
  let query = supabase.from(table).select('*');

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query = query.eq(key, value);
  });

  if (orderBy) {
    query = query.order(orderBy, { ascending });
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === 'PGRST204' || (error.message && (error.message.includes('does not exist') || error.message.includes('schema cache')))) {
      console.warn(`Table or column missing for ${table}:`, error.message);
      return [];
    }
    withError(error);
  }

  return (data || []).map(normalizeId);
};

export const getById = async (table, id) => {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) return null;
  return normalizeId(data);
};

export const insertRow = async (table, payload) => {
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) withError(error);
  return normalizeId(data);
};

export const insertRows = async (table, payloadArray) => {
  const { data, error } = await supabase.from(table).insert(payloadArray).select('*');
  if (error) withError(error);
  return (data || []).map(normalizeId);
};

export const updateRow = async (table, id, payload) => {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();
  if (error) withError(error);
  return normalizeId(data);
};

export const deleteRow = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) withError(error);
};

export const upsertVolunteerProfile = async (user) => {
  const existing = await getById(TABLES.volunteers, user.id);

  if (existing) {
    return updateRow(TABLES.volunteers, user.id, {
      name: user.fullName || existing.name,
      email: user.email,
      role: user.role,
      pincode: user.pincode || existing.pincode,
    });
  }

  return insertRow(TABLES.volunteers, {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    pincode: user.pincode || '',
    status: 'approved',
    skills: user.skills || [],
    eventsJoined: 0,
    hoursWorked: 0,
    impactScore: 0,
  });
};
