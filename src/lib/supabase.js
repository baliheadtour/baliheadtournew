import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const deleteSupabaseFiles = async (urls) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;
  const bucket = 'discovering_bali_images';
  
  const paths = urls
    .map(url => {
      if (!url || typeof url !== 'string') return null;
      const parts = url.split(`/public/${bucket}/`);
      if (parts.length === 2) return parts[1];
      return null;
    })
    .filter(Boolean);

  if (paths.length > 0) {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.error("Error deleting old images from Supabase:", error);
    } else {
      console.log("Successfully deleted orphaned images:", paths);
    }
  }
};
