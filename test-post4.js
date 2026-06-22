import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const insertData = {
    title: "Test Empty",
    slug: "/blog/test-empty",
    content: "Content",
    meta_description: "meta desc",
    category: "category",
    location: "",
    status: "Draft",
    image: "",
    views: '0'
  };

  const { data, error } = await supabase.from('blogs').insert([insertData]).select().single();
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
