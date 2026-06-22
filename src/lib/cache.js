import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';

export const getHomepageListings = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('listings')
      .select('id, type, title, location, price, duration, category, rating, reviews, status, image, company_name, originalService:data->originalService, isCampaignPinned:data->isCampaignPinned, campaignTitle:data->campaignTitle, campaignDescription:data->campaignDescription, campaignLabel:data->campaignLabel, campaignVideo:data->campaignVideo, campaignYoutubeLink:data->campaignYoutubeLink, campaignRecommendation:data->campaignRecommendation, campaignIgLink:data->campaignIgLink, isBestTripPinned:data->isBestTripPinned, spaSetting:data->spaSetting, tourTiers:data->tourTiers, allInclusiveTiers:data->allInclusiveTiers, allInclusiveSurcharge:data->allInclusiveSurcharge, pricingType:data->pricingType, min60:data->min60, min90:data->min90, min120:data->min120, dailyPrice:data->dailyPrice, weeklyPrice:data->weeklyPrice, monthlyPrice:data->monthlyPrice, badge:data->badge')
      .eq('status', 'Active');
    return data || [];
  },
  ['homepage-listings'],
  { revalidate: 3600, tags: ['listings'] }
);

export const getActiveListings = unstable_cache(
  async () => {
    const { data } = await supabase.from('listings').select('*').eq('status', 'Active');
    return data || [];
  },
  ['active-listings'],
  { revalidate: 3600, tags: ['listings'] }
);

export const getPublishedBlogs = unstable_cache(
  async (limit = 4) => {
    const { data } = await supabase
      .from('blogs')
      .select('id, title, slug, image, category')
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },
  ['published-blogs'],
  { revalidate: 3600, tags: ['blogs'] }
);

export const getHomepageSettings = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('homepage_settings')
      .select('campaign_video, campaign_youtube_link, campaign_recommendation, campaign_ig_link, campaign_recommendation_2, campaign_ig_link_2')
      .eq('id', 1)
      .single();
    return data || null;
  },
  ['homepage-settings'],
  { revalidate: 3600, tags: ['homepage_settings'] }
);
