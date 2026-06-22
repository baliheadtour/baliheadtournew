import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { listingId, reviewId } = body;

    if (!listingId || !reviewId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Initialize Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Fetch the existing listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('rating, reviews, data')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 3. Remove the review
    const dataObj = listing.data || {};
    let reviewsList = Array.isArray(dataObj.reviewsList) ? [...dataObj.reviewsList] : [];
    
    const initialCount = reviewsList.length;
    reviewsList = reviewsList.filter(r => r.id !== reviewId);

    if (reviewsList.length === initialCount) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    dataObj.reviewsList = reviewsList;

    // 4. Recalculate average rating and total reviews
    const totalReviews = reviewsList.length;
    let newAverage = 5.0; // Default if no reviews left
    if (totalReviews > 0) {
      const sumRatings = reviewsList.reduce((sum, r) => sum + r.rating, 0);
      newAverage = sumRatings / totalReviews;
    }

    // 5. Update database
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        rating: newAverage,
        reviews: totalReviews,
        data: dataObj
      })
      .eq('id', listingId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, newAverage, totalReviews }, { status: 200 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
