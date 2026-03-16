import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

async function run() {
  console.log('Inserting Users...');
  const { error: e1 } = await supabase.from('users').insert(data.users);
  if (e1) console.error('Users Error:', e1.message);

  console.log('Inserting Volunteers...');
  const { error: e2 } = await supabase.from('volunteers').insert(data.volunteers);
  if (e2) console.error('Volunteers Error:', e2.message);

  console.log('Inserting Events...');
  const { error: e3 } = await supabase.from('events').insert(data.events);
  if (e3) console.error('Events Error:', e3.message);

  console.log('Inserting Resources...');
  const { error: e4 } = await supabase.from('resources').insert(data.resources);
  if (e4) console.error('Resources Error:', e4.message);

  console.log('Inserting Disasters...');
  const { error: e5 } = await supabase.from('disasters').insert(data.disasters);
  if (e5) console.error('Disasters Error:', e5.message);

  console.log('✅ Seeding complete!');
}

run();
