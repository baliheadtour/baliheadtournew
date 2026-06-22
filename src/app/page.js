import HomeClient from './HomeClient';
import { getHomepageListings, getPublishedBlogs, getHomepageSettings } from '@/lib/cache';

// Cache this page for 1 hour (3600 seconds) on the CDN
export const revalidate = 3600;

export default async function Page() {

  const listingsData = await getHomepageListings();
  
  const initialListings = (listingsData || []).map(d => ({
    ...d,
    service: d.originalService || d.type
  }));

  // Fetch blogs
  const initialBlogs = await getPublishedBlogs(4);

  // Fetch settings
  const settingsData = await getHomepageSettings();

  const initialSettings = settingsData ? {
    campaignVideo: settingsData.campaign_video || "",
    campaignYoutubeLink: settingsData.campaign_youtube_link || "",
    campaignRecommendation: settingsData.campaign_recommendation || "",
    campaignIgLink: settingsData.campaign_ig_link || "",
    campaignRecommendation2: settingsData.campaign_recommendation_2 || "",
    campaignIgLink2: settingsData.campaign_ig_link_2 || ""
  } : null;

  return (
    <HomeClient 
      initialListings={initialListings || []} 
      initialBlogs={initialBlogs || []} 
      initialSettings={initialSettings} 
    />
  );
}
