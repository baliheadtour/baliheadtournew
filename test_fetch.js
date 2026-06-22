const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('bookings').select('*').eq('category', 'Tour').limit(10);
  console.log("Found:", data ? data.length : 0);
  if (data && data.length > 0) {
    const wishes = data.filter(d => d.details && d.details.isWishlist === true);
    console.log("Wishes found:", wishes.length);
    if (wishes.length > 0) {
      console.log("Sample Wishlist item:", JSON.stringify(wishes[0].details, null, 2));
    }
  }
}
test();
