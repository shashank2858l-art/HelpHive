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
  ],
  help_requests: [
    { title: 'Urgent Medical Assistance', description: 'Need a doctor.', status: 'open', urgency: 'high', location: 'Chennai' }
  ],
  volunteer_activity: [
    { volunteerId: '123e4567-e89b-12d3-a456-426614174001', hoursContributed: 8, timestamp: new Date().toISOString() }
  ]
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function forceSeed(name, records) {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[${name}] Attempt ${attempts}...`);
    
    // Warm up
    await supabase.from(name).select('id').limit(1);
    
    const { error } = await supabase.from(name).upsert(records, { onConflict: name === 'users' ? 'email' : (name === 'resources' ? 'resourceName' : (name === 'disasters' ? 'type' : 'id')) });
    
    if (!error) {
      console.log(`[${name}] ✅ SUCCESS`);
      return;
    }
    
    console.warn(`[${name}] ⚠️  Failed: ${error.message}`);
    if (attempts < maxAttempts) {
      console.log(`[${name}] Waiting 2 seconds...`);
      await sleep(2000);
    }
  }
  console.error(`[${name}] ❌ FAILED after ${maxAttempts} attempts`);
}

async function run() {
  console.log('🚀 Starting Persistent Seed...');
  await forceSeed('users', data.users);
  await forceSeed('volunteers', data.volunteers);
  await forceSeed('events', data.events);
  await forceSeed('resources', data.resources);
  await forceSeed('disasters', data.disasters);
  await forceSeed('help_requests', data.help_requests);
  await forceSeed('volunteer_activity', data.volunteer_activity);
  console.log('🏁 Finished All Table Seeds');
}

run();
