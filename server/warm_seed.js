import 'dotenv/config';
import { supabase } from './services/supabaseClient.js';

const data = {
  users: [
    { id: '123e4567-e89b-12d3-a456-426614174001', fullName: 'Aisha Sharma', email: 'aisha.demo@helphive.org', role: 'volunteer', passwordHash: 'noop' },
    { id: '123e4567-e89b-12d3-a456-426614174002', fullName: 'Rahul Verma', email: 'rahul.demo@helphive.org', role: 'volunteer', passwordHash: 'noop' }
  ],
  volunteers: [
    { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Aisha Sharma', email: 'aisha.demo@helphive.org', role: 'medical', status: 'approved', skills: ['First Aid', 'Doctor'], impactScore: 450, eventsJoined: 12, hoursWorked: 85, location: 'Mumbai' },
    { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Rahul Verma', email: 'rahul.demo@helphive.org', role: 'logistics', status: 'approved', skills: ['Driving'], impactScore: 210, eventsJoined: 5, hoursWorked: 40, location: 'Chennai' }
  ],
  events: [
    { id: '123e4567-e89b-12d3-a456-426614175001', title: 'Chennai Flood Relief Camp', description: 'Setting up a relief camp.', location: 'Chennai', date: new Date().toISOString(), status: 'active', volunteersRequired: 50 },
    { id: '123e4567-e89b-12d3-a456-426614175002', title: 'Medical Supply Distribution', description: 'Distributing essential supplies.', location: 'Mumbai', date: new Date().toISOString(), status: 'planned', volunteersRequired: 20 }
  ],
  resources: [
    { resourceName: 'First Aid Kits', quantity: 500, status: 'available', location: 'Central Warehouse' },
    { resourceName: 'Blankets', quantity: 1200, status: 'available', location: 'Chennai Hub' }
  ],
  disasters: [
    { type: 'Flood', location: 'Chennai', severity: 'high', status: 'active' },
    { type: 'Cyclone Alert', location: 'Odisha Coast', severity: 'critical', status: 'active' }
  ]
};

async function seedTable(name, records) {
  console.log(`Warming cache for ${name}...`);
  await supabase.from(name).select('id').limit(1);
  
  console.log(`Inserting into ${name}...`);
  const { error } = await supabase.from(name).insert(records);
  if (error) {
    console.error(`${name} Error:`, error.message);
  } else {
    console.log(`${name} SUCCESS`);
  }
}

async function run() {
  await seedTable('users', data.users);
  await seedTable('volunteers', data.volunteers);
  await seedTable('events', data.events);
  await seedTable('resources', data.resources);
  await seedTable('disasters', data.disasters);
  console.log('✅ Warm-up Seeding DONE');
}

run();
