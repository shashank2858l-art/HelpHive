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
  const { fullName, email, password, role: requestedRole = 'volunteer', phone, location, skills = [] } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email and password are required' });
  }

  // Only the specific admin email can have the admin role
  const finalRole = String(email).toLowerCase() === 'admin@helphive.org' ? 'admin' : 'volunteer';

  const users = await listRows(TABLES.users, { filters: { email: String(email).toLowerCase() } });
  if (users.length) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await insertRow(TABLES.users, {
    fullName,
    email: String(email).toLowerCase(),
    passwordHash,
    role: finalRole,
    phone,
    location,
    skills,
  });

  if (finalRole === 'volunteer') {
    try {
      await upsertVolunteerProfile(user);
    } catch (error) {
      console.warn('Volunteer profile sync skipped:', error.message);
    }
  }

  return res.status(201).json({ token: signToken(user.id), user: sanitizeUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const targetEmail = String(email || '').toLowerCase().trim();

  console.log('[AUTH_DEBUG] Attempting login for:', targetEmail);

  const users = await listRows(TABLES.users, { filters: { email: targetEmail } });
  const user = users[0];

  if (!user) {
    console.log('[AUTH_DEBUG] User not found in DB:', targetEmail);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password || '', user.passwordHash || '');
  console.log('[AUTH_DEBUG] Password match for', targetEmail, ':', isMatch);
  
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ token: signToken(user.id), user: sanitizeUser(user) });
};

import { verifyGoogleToken } from '../services/firebaseAuth.js';
import { randomBytes } from 'crypto';

export const googleLogin = async (req, res) => {
  const { token, role: requestedRole = 'volunteer' } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    const decodedToken = await verifyGoogleToken(token);
    const email = decodedToken.email.toLowerCase();
    const fullName = decodedToken.name || 'Google User';

    // Only allow admin@helphive.org to be Admin
    const isTargetAdmin = email === 'admin@helphive.org';

    // Block Google Auth ONLY for the actual Admin account
    if (isTargetAdmin) {
       return res.status(401).json({ message: 'Admin account must use Email/Password login.' });
    }

    let users = await listRows(TABLES.users, { filters: { email } });
    let user = users[0];

    if (!user) {
      const randomPassword = randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await insertRow(TABLES.users, {
        fullName,
        email,
        passwordHash,
        role: 'volunteer', // Always volunteer for new Google users
        phone: '',
        location: '',
        skills: [],
      });

      try {
        await upsertVolunteerProfile(user);
      } catch (error) {
        console.warn('Volunteer profile sync skipped:', error.message);
      }
    } else {
      // If user exists, ensure they are treated as volunteer (unless they are already admin, but we blocked admin above)
      if (user.role !== 'volunteer') {
         user = await updateRow(TABLES.users, user.id, { role: 'volunteer' });
         try {
           await upsertVolunteerProfile(user);
         } catch (error) {
           console.warn('Volunteer profile sync skipped:', error.message);
         }
      }
    }

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
