const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = '10-hidden-beaches-in-bali-you-need-to-visit-in-2026';
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .or(`slug.eq.${slug},slug.eq./blog/${slug},slug.eq.blog/${slug}`)
    .single();
  console.log({data, error});
}
run();
