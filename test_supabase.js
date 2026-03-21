import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wusyykhngnxglvftrmrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c3l5a2huZ254Z2x2ZnRybXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDE4MTksImV4cCI6MjA4NzYxNzgxOX0.t4HrTIT-NQida5UgA56M6IGVkuf2RDLt1zI19mAhH_I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFetchProfile(userId) {
  console.log('Testing fetchProfile for:', userId);
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  console.log('Result:', { data, error });
}

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log('Signing up with:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User',
        phone: '1234567890',
        profile_type: 'patient'
      }
    }
  });

  if (error) {
    console.error('SignUp Error:', error);
    return;
  }

  const userId = data.user.id;
  console.log('Signed up! User ID:', userId);

  // Poll for profile
  for (let i=0; i<8; i++) {
    await testFetchProfile(userId);
    await new Promise(r => setTimeout(r, 250));
  }

  console.log('Signing in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'password123'
  });

  if (signInError) {
    console.error('SignIn Error:', signInError);
  } else {
    console.log('Signed in successfully!', signInData.user.id);
    await testFetchProfile(signInData.user.id);
  }
}

run();
