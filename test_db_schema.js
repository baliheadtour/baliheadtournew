const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('bookings').insert({
    id: `FAV-${Date.now()}`,
    customer_name: 'test',
    contact_info: 'test@example.com',
    service_name: 'test',
    booking_date: '2025-01-01',
    amount: "0",
    status: 'Pending',
    category: 'Water', // Invalid category?
    details: { isWishlist: true }
  });
  console.log("Insert Water:", error);
}
test();
