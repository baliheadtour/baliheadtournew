import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, name, rating, comment, accessCode, userImage } = body;

    // 1. Validate Access Code
    if (accessCode !== 'MBD-123') {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
    }

    // 2. Validate input
    if (!id || !name || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. Fetch the existing listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('rating, reviews, data')
      .eq('id', id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 5. Append review to data.reviewsList
    const dataObj = listing.data || {};
    const reviewsList = Array.isArray(dataObj.reviewsList) ? [...dataObj.reviewsList] : [];
    
    const newReview = {
      id: Date.now().toString(),
      user: name,
      userImage: userImage || null,
      rating: Number(rating),
      comment: comment,
      date: new Date().toISOString(),
    };

    reviewsList.push(newReview);
    dataObj.reviewsList = reviewsList;

    // 6. Recalculate average rating and total reviews
    const totalReviews = reviewsList.length;
    // Calculate new average. If it's the first real review, we override the default '5.0'
    const sumRatings = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = sumRatings / totalReviews;

    // 7. Update database
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        rating: newAverage,
        reviews: totalReviews,
        data: dataObj
      })
      .eq('id', id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, newReview, newAverage, totalReviews }, { status: 200 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
