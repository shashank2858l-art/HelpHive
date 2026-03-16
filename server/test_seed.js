import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const data = {
  users: [
    { id: '123e4567-e89b-12d3-a456-426614174001', fullName: 'Aisha Sharma', email: 'aisha.demo@helphive.org', role: 'volunteer', passwordHash: 'noop' },
    { id: '123e4567-e89b-12d3-a456-426614174002', fullName: 'Rahul Verma', email: 'rahul.demo@helphive.org', role: 'volunteer', passwordHash: 'noop' }
  ],
  volunteers: [
    { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Aisha Sharma', email: 'aisha.demo@helphive.org', impactScore: 450, location: 'Mumbai' },
    { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Rahul Verma', email: 'rahul.demo@helphive.org', impactScore: 210, location: 'Chennai' }
  ]
};

async function run() {
  console.log('Testing Users...');
  const { error: e1 } = await supabase.from('users').upsert(data.users);
  console.log('Users:', e1 ? e1.message : 'SUCCESS');

  console.log('Testing Volunteers...');
  const { error: e2 } = await supabase.from('volunteers').upsert(data.volunteers);
  console.log('Volunteers:', e2 ? e2.message : 'SUCCESS');
}

run();
