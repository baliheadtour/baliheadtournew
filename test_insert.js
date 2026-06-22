const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('bookings').insert({
    id: `FAV-${Date.now()}`,
    customer_name: 'Test',
    contact_info: 'test@example.com',
    service_name: 'Test Tour',
    booking_date: new Date().toISOString().split('T')[0],
    amount: "0",
    status: 'Pending',
    category: 'Tour',
    details: { customer_email: 'test@example.com', isWishlist: true }
  });
  console.log("Insert result:", { data, error });
}
test();
