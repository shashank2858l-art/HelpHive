import 'dotenv/config';
import { supabase } from './services/supabaseClient.js';

const encodeLocation = (location, lat, lng) => {
  const finalLat = lat || (12.9716 + (Math.random() - 0.5) * 5).toFixed(4);
  const finalLng = lng || (77.5946 + (Math.random() - 0.5) * 5).toFixed(4);
  // Using empty ownerId so these public demonstration pins are visible to everyone
  return `${location || 'Unknown'}||||${finalLat}||${finalLng}`;
};

const demoEvents = [
  {
    id: '123e4567-e89b-12d3-a456-426614175001',
    title: 'Chennai Flood Relief Camp',
    description: 'Setting up a relief camp for the affected areas in South Chennai.',
    location: encodeLocation('Chennai, Tamil Nadu', 13.0827, 80.2707),
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'active',
    volunteersRequired: 50,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614175002',
    title: 'Medical Supply Distribution',
    description: 'Distributing essential medical supplies to local clinics.',
    location: encodeLocation('Mumbai, Maharashtra', 19.0760, 72.8777),
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'planned',
    volunteersRequired: 20,
  }
];

const demoResources = [
  { resourceName: 'First Aid Kits', quantity: 500, status: 'available', location: encodeLocation('Central Warehouse') },
  { resourceName: 'Blankets', quantity: 1200, status: 'available', location: encodeLocation('Chennai Hub') },
  { resourceName: 'Drinking Water (Litres)', quantity: 5000, status: 'in_transit', location: encodeLocation('Mumbai Port') }
];

const demoUsers = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    fullName: 'Aisha Sharma',
    email: 'aisha.demo@helphive.org',
    role: 'volunteer',
    passwordHash: '$2a$10$wN1r0m/kZlX1q0r/kZlX1e0m/kZlX1q0r/kZlX1e0m/kZlX1q',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    fullName: 'Rahul Verma',
    email: 'rahul.demo@helphive.org',
    role: 'volunteer',
    passwordHash: '$2a$10$wN1r0m/kZlX1q0r/kZlX1e0m/kZlX1q0r/kZlX1e0m/kZlX1q',
  }
];

const demoVolunteers = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Aisha Sharma',
    email: 'aisha.demo@helphive.org',
    role: 'medical',
    status: 'approved',
    skills: ['First Aid', 'Doctor'],
    impactScore: 450,
    eventsJoined: 12,
    hoursWorked: 85,
    location: encodeLocation('Mumbai, Maharashtra'),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Rahul Verma',
    email: 'rahul.demo@helphive.org',
    role: 'logistics',
    status: 'approved',
    skills: ['Driving', 'Inventory Management'],
    impactScore: 210,
    eventsJoined: 5,
    hoursWorked: 40,
    location: encodeLocation('Chennai, Tamil Nadu'),
  }
];

const demoDisasters = [
  { type: 'Flood', location: encodeLocation('Chennai, Tamil Nadu', 13.0827, 80.2707), severity: 'high', status: 'active' },
  { type: 'Cyclone Alert', location: encodeLocation('Odisha Coast'), severity: 'critical', status: 'active' }
];

const demoHelpRequests = [
  { title: 'Urgent Medical Assistance required', description: 'Need a doctor immediately at the relief camp.', status: 'open', urgency: 'high', location: encodeLocation('Chennai, Tamil Nadu') },
  { title: 'Food Shortage', description: 'Running out of food packets for 50 people.', status: 'in_progress', urgency: 'medium', location: encodeLocation('Chennai, Tamil Nadu') }
];

const demoActivity = [
  { volunteerId: '123e4567-e89b-12d3-a456-426614174001', hoursContributed: 8, timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
  { volunteerId: '123e4567-e89b-12d3-a456-426614174001', hoursContributed: 12, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { volunteerId: '123e4567-e89b-12d3-a456-426614174002', hoursContributed: 5, timestamp: new Date(Date.now() - 86400000 * 20).toISOString() },
  { volunteerId: '123e4567-e89b-12d3-a456-426614174002', hoursContributed: 7, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seed() {
  console.log('Waiting 3 seconds for Supabase schema cache...');
  await sleep(3000);

  console.log('Seeding data via upsert...');

  // 1. Users
  console.log('Upserting Users...');
  const { error: err0 } = await supabase.from('users').upsert(demoUsers, { onConflict: 'email' });
  if (err0) {
      console.error('Users Error:', err0);
      throw err0;
  }

  // 2. Events
  console.log('Upserting Events...');
  const { error: err1 } = await supabase.from('events').upsert(demoEvents, { onConflict: 'id' });
  if (err1) {
      console.error('Events Error:', err1);
      throw err1;
  }

  // 3. Resource
  console.log('Upserting Resources...');
  const { error: err2 } = await supabase.from('resources').upsert(demoResources, { onConflict: 'resourceName' });
  if (err2) {
      console.error('Resources Error:', err2);
      throw err2;
  }

  // 4. Volunteers
  console.log('Upserting Volunteers...');
  const { error: err3 } = await supabase.from('volunteers').upsert(demoVolunteers, { onConflict: 'id' });
  if (err3) {
      console.error('Volunteers Error:', err3);
      throw err3;
  }

  // 5. Disasters
  console.log('Upserting Disasters...');
  const { error: err4 } = await supabase.from('disasters').upsert(demoDisasters, { onConflict: 'type' });
  if (err4) {
      console.error('Disasters Error:', err4);
      throw err4;
  }

  // 6. Help Requests
  console.log('Upserting Help Requests...');
  const { error: err5 } = await supabase.from('help_requests').upsert(demoHelpRequests, { onConflict: 'title' });
  if (err5) {
      console.error('Help Requests Error:', err5);
      throw err5;
  }

  // 7. Activity
  console.log('Upserting Volunteer Activity...');
  // For activity, we don't have a natural unique key in the demo data, so we'll just insert if empty or similar
  const { error: err6 } = await supabase.from('volunteer_activity').upsert(demoActivity);
  if (err6) {
      console.error('Activity Error:', err6);
      throw err6;
  }

  console.log('✅ Demo data successfully seeded into Supabase!');
}

seed().catch(err => {
    console.error('Critical Seeding Failure:', err.message || err);
    process.exit(1);
});
