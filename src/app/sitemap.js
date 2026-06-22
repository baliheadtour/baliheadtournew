import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";

export default async function sitemap() {
  const baseUrl = "https://www.bobbybaliguide.com";

  // Get all active tours
  const { data: listings } = await supabase
    .from('listings')
    .select('title, updated_at')
    .eq('status', 'Active');

  const tourUrls = (listings || []).map((tour) => ({
    url: `${baseUrl}/tours/${generateSlug(tour.title)}`,
    lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Get all published blogs
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('status', 'Published');

  const blogUrls = (blogs || []).map((blog) => {
    // Clean up slug to avoid double slashes or wrong prefixes
    let cleanSlug = blog.slug || "";
    if (cleanSlug.startsWith('/')) cleanSlug = cleanSlug.substring(1);
    if (cleanSlug.startsWith('blog/')) cleanSlug = cleanSlug.substring(5);

    return {
      url: `${baseUrl}/blog/${cleanSlug}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  // Core static routes
  const staticRoutes = [
    '',
    '/tours',
    '/about',
    '/contact',
    '/map',
    '/esim',
    '/blog'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.9,
  }));

  return [...staticRoutes, ...tourUrls, ...blogUrls];
}
