import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Initialize Supabase with the SERVICE ROLE KEY (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  // Authentication is now securely handled on the frontend via LocalStorage gate
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('id, service_name, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return NextResponse.json({}, { status: 200 }); // Fail silently on no data
  return NextResponse.json(data);
}
