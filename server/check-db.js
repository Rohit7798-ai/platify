import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking auth users...');
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  if (err1) console.error(err1);
  else console.log(users.users.map(u => ({ email: u.email, confirmed: !!u.email_confirmed_at })));

  console.log('\nChecking profiles...');
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('*');
  if (err2) console.error(err2);
  else console.log(profiles);
}

check();
