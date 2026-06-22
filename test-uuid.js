const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('blogs').select('*').eq('id', '74AB4CB2-E2FE-436D-BCD6-ADBDAAAB9D61').single();
  console.log({data, error});
}
run();
