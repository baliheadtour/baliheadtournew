import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
     console.log("No reviews table or error:", error);
  } else {
     console.log("Reviews table exists!");
  }
}
run();
