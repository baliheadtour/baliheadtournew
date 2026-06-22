const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: firstBlog } = await supabase.from('blogs').select('*').limit(1).single();
  if (!firstBlog) return console.log("No blog found");

  const updateData = {
    title: "Test Edit",
    location: "Bali",
    category: "Beach",
    slug: "/blog/test-edit",
    status: "Published",
    image: "",
    content: "Content edit test",
    meta_description: "Meta description test",
    created_at: firstBlog.created_at, // Wait! The frontend might be sending created_at!
  };

  const { data, error } = await supabase.from('blogs').update(updateData).eq('id', firstBlog.id).select();
  console.log({data, error});
}
run();
