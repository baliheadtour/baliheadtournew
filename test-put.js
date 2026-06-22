const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('blogs').update({
    title: "Test Update",
    location: "Bali",
    category: "Beach",
    slug: "/blog/test-update",
    status: "Published",
    image: "",
    content: "Content test"
  }).eq('id', '6c8ea3c5-ff45-4c8c-abd8-0ccd4040fb0e').select();
  console.log({data, error});
}
run();
