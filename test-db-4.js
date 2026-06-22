import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('listings').select('id, data').ilike('title', '%Bali Heritage Tour%');
  if (data && data.length > 0) {
     const listing = data[0];
     console.log("Found listing:", listing.id);
     
     // reset reviews
     const dataObj = listing.data;
     dataObj.reviewsList = [];
     
     await supabase.from('listings').update({ rating: 5, reviews: 0, data: dataObj }).eq('id', listing.id);
     console.log("Reviews reset successfully for", listing.id);
  }
}
run();
