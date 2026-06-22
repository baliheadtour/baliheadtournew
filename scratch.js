const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('listings').select('*').eq('id', '44fddb1e-007b-4532-9143-f1a90f2efbad').single();
  if (error) console.error(error);
  else {
    console.log("Type:", data.type);
    console.log("Pricing Type:", data.data.pricingType);
    console.log("All Inclusive Surcharge:", data.data.allInclusiveSurcharge);
  }
}
main();
