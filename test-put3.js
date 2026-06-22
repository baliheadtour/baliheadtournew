const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const updateData = {
    title: "10 Hidden Beaches in Bali You Need to Visit in 2026",
    location: "",
    category: "Beach",
    slug: "/blog/10-hidden-beaches-in-bali-you-need-to-visit-in-2026",
    status: "Published",
    image: "",
    content: "Test edit",
    meta_description: "Discover 10 hidden beaches in Bali...",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('blogs').update(updateData).eq('slug', '/blog/10-hidden-beaches-in-bali-you-need-to-visit-in-2026').select().single();
  console.log({data, error});
}
run();
