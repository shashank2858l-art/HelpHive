import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAdmin() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@helphive.org')
    .single();

  if (error) {
    console.error('Error fetching admin:', error.message);
  } else {
    console.log('--- ADMIN DATA ---');
    console.log('ID:', data.id);
    console.log('Email:', data.email);
    console.log('Role:', data.role);
    console.log('Hash Length:', data.passwordHash?.length);
    console.log('Hash snippet:', data.passwordHash?.substring(0, 10));
    console.log('-----------------');
  }
}

checkAdmin();
