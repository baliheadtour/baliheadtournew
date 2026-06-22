const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const updateData = {
    title: "10 Hidden Beaches",
    location: "Bali",
    category: "Beach",
    slug: "/blog/10-hidden-beaches",
    meta_description: "meta desc",
    status: "Published",
    image: "",
    content: "Content test",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('blogs').update(updateData).eq('id', '74ab4cb2-e2fe-436d-bcd6-adbdaaab9d61').select().single();
  console.log({data, error});
}
run();
