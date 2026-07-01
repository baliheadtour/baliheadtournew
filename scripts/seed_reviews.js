const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const reviewComments = [
  "Absolutely amazing experience! Highly recommended.",
  "The guide was fantastic and very knowledgeable.",
  "Such a beautiful place, everything was well organized.",
  "We had so much fun! The trip exceeded our expectations.",
  "Great value for money. The driver was very polite.",
  "One of the best days of our trip to Bali.",
  "Very professional service from start to finish.",
  "Breathtaking views and great activities.",
  "Everything was perfect, I would definitely book again.",
  "A must-do when you visit Bali!",
  "Highly professional and friendly staff.",
  "Incredible experience, very smooth organization.",
  "We loved every minute of it.",
  "Our guide went above and beyond to make our day special.",
  "Memorable experience, highly recommended for families.",
  "The best tour we had in Bali. Highly recommended!",
  "Very punctual and the car was very clean.",
  "Awesome adventure! Definitely worth the price.",
  "Beautiful sights and an amazing guide.",
  "Everything was exactly as described."
];

const names = [
  "John D.", "Sarah M.", "David W.", "Emma S.", "Michael R.",
  "Jessica T.", "Chris P.", "Amanda K.", "James H.", "Olivia C.",
  "Daniel L.", "Sophia B.", "Matthew G.", "Isabella N.", "Andrew V.",
  "Mia F.", "Joshua E.", "Charlotte A.", "Kevin O.", "Amelia Y.",
  "Ryan J.", "Harper U.", "Jacob Q.", "Evelyn I.", "Nicholas Z.",
  "Anna P.", "William T.", "Liam S.", "Lucas C.", "Oliver M.",
  "Thomas W.", "Emily R.", "Chloe S.", "Ava K."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateReviews(count) {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    // Generate a random date in the last year
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - getRandomInt(1, 365));

    reviews.push({
      id: Date.now().toString() + i,
      user: getRandomItem(names),
      userImage: null,
      // Random rating mostly 5, sometimes 4
      rating: Math.random() > 0.8 ? 4 : 5,
      comment: getRandomItem(reviewComments),
      date: pastDate.toISOString(),
    });
  }
  return reviews;
}

async function seedReviews() {
  console.log("Fetching listings...");
  const { data: listings, error } = await supabase.from('listings').select('id, data');

  if (error) {
    console.error("Error fetching listings:", error);
    return;
  }

  console.log(`Found ${listings.length} listings. Seeding reviews...`);

  for (const listing of listings) {
    const dataObj = listing.data || {};
    let reviewsList = Array.isArray(dataObj.reviewsList) ? [...dataObj.reviewsList] : [];
    
    // Generate 25 to 50 new reviews
    const numNewReviews = getRandomInt(25, 50);
    const newReviews = generateReviews(numNewReviews);
    
    // Append to existing
    reviewsList = [...reviewsList, ...newReviews];
    dataObj.reviewsList = reviewsList;

    const totalReviews = reviewsList.length;
    const sumRatings = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = sumRatings / totalReviews;

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        rating: newAverage,
        reviews: totalReviews,
        data: dataObj
      })
      .eq('id', listing.id);

    if (updateError) {
      console.error(`Error updating listing ${listing.id}:`, updateError);
    } else {
      console.log(`Successfully added ${numNewReviews} reviews to listing ${listing.id}. Total reviews now: ${totalReviews}, Avg Rating: ${newAverage.toFixed(1)}`);
    }
  }

  console.log("Done seeding reviews.");
}

seedReviews();
