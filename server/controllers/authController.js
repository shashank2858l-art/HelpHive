import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TABLES } from '../models/tableNames.js';
import { getById, insertRow, listRows, updateRow, upsertVolunteerProfile } from '../services/dataService.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  id: user.id,
  _id: user.id,
  fullName: user.fullName,
  name: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  location: user.location || '',
  skills: user.skills || [],
});

export const register = async (req, res) => {
  const { fullName, email, password, role = 'volunteer', phone, location, skills = [] } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email and password are required' });
  }

  const users = await listRows(TABLES.users, { filters: { email: String(email).toLowerCase() } });
  if (users.length) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await insertRow(TABLES.users, {
    fullName,
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    phone,
    location,
    skills,
  });

  if (role === 'volunteer') {
    try {
      await upsertVolunteerProfile(user);
    } catch (error) {
      // Keep auth functional even when volunteer profile schema is not initialized yet.
      console.warn('Volunteer profile sync skipped:', error.message);
    }
  }

  return res.status(201).json({ token: signToken(user.id), user: sanitizeUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const users = await listRows(TABLES.users, { filters: { email: String(email || '').toLowerCase() } });
  const user = users[0];

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash || ''))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ token: signToken(user.id), user: sanitizeUser(user) });
};

import { verifyGoogleToken } from '../services/firebaseAuth.js';
import { randomBytes } from 'crypto';

export const googleLogin = async (req, res) => {
  const { token, role = 'volunteer' } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    // 1. Verify token with Firebase Admin
    const decodedToken = await verifyGoogleToken(token);
    const email = decodedToken.email.toLowerCase();
    const fullName = decodedToken.name || 'Google User';

    // 2. Check if user already exists in Supabase
    let users = await listRows(TABLES.users, { filters: { email } });
    let user = users[0];

    // 3. If they don't exist, register them automatically
    if (!user) {
      // Generate a random placeholder password since they use Google Auth
      const randomPassword = randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await insertRow(TABLES.users, {
        fullName,
        email,
        passwordHash,
        role: role, // Requested role (admin or volunteer)
        phone: '',
        location: '',
        skills: [],
      });

      // Also create their profile
      if (role === 'volunteer') {
        try {
          await upsertVolunteerProfile(user);
        } catch (error) {
          console.warn('Volunteer profile sync skipped:', error.message);
        }
      }
    } else if (user.role !== role) {
      // 3.1 Block Google Auth if trying to switch to/from Admin
      if (role === 'admin' || user.role === 'admin') {
         return res.status(401).json({ message: 'Admin accounts must use Email/Password login.' });
      }

      // 3.2 If they exist but requested a different role (e.g. switching from Volunteer to Admin)
      console.log(`Updating user role from ${user.role} to ${role}`);
      user = await updateRow(TABLES.users, user.id, { role });
      
      if (role === 'volunteer') {
          try {
            await upsertVolunteerProfile(user);
          } catch (error) {
            console.warn('Volunteer profile sync skipped:', error.message);
          }
      }
    }

    // 4. Return standard JWT session token
    return res.json({ token: signToken(user.id), user: sanitizeUser(user) });
  } catch (error) {
    console.error('Google Auth Failed', error);
    return res.status(401).json({ message: 'Google authentication failed' });
  }
};

export const me = async (req, res) => {
  const user = await getById(TABLES.users, req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(sanitizeUser(user));
};
