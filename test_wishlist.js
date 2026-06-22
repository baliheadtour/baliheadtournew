const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('bookings').select('id, category, details').eq('details->>isWishlist', 'true').limit(10);
  console.log("Found wishlists:", data?.length);
  if (data?.length > 0) {
    console.log(JSON.stringify(data[data.length - 1], null, 2));
  }
}
test();
