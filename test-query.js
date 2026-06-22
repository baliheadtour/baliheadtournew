require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, type, title, location, price, duration, category, rating, reviews, status, image, company_name, originalService:data->originalService, isCampaignPinned:data->isCampaignPinned, campaignTitle:data->campaignTitle, campaignDescription:data->campaignDescription, campaignLabel:data->campaignLabel, campaignVideo:data->campaignVideo, campaignYoutubeLink:data->campaignYoutubeLink, campaignRecommendation:data->campaignRecommendation, campaignIgLink:data->campaignIgLink, isBestTripPinned:data->isBestTripPinned, spaSetting:data->spaSetting, tourTiers:data->tourTiers, allInclusiveTiers:data->allInclusiveTiers, allInclusiveSurcharge:data->allInclusiveSurcharge, pricingType:data->pricingType, min60:data->min60, min90:data->min90, min120:data->min120, dailyPrice:data->dailyPrice, weeklyPrice:data->weeklyPrice, monthlyPrice:data->monthlyPrice, badge:data->badge')
    .eq('status', 'Active')
    .limit(1);
  console.log(error);
}
run();
