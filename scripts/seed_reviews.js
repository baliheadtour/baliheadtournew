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
  "This was hands down one of the absolute highlights of our entire trip to Bali! From the moment we were picked up at our hotel, everything was incredibly seamless. Our guide was not only extremely punctual but also wonderfully knowledgeable about the local culture, history, and hidden gems along the way. We never felt rushed, and they made sure we had plenty of time to take photos and really soak in the stunning views. The vehicle was immaculately clean and air-conditioned, which was a lifesaver in the heat. I cannot recommend this experience highly enough—if you are coming to Bali, this is an absolute must-do. Worth every single penny!",
  "I don't usually write long reviews, but I felt compelled to share how phenomenal this tour was. The entire itinerary was perfectly paced, striking a great balance between sightseeing and relaxation. Our driver navigated the busy Bali roads with such professionalism and ease, making us feel completely safe the entire time. The locations we visited were breathtaking, far exceeding what we expected from the pictures. What really set this apart, though, was the warmth and hospitality of our guide. They went completely out of their way to ensure we were comfortable, hydrated, and entertained with fascinating stories. A flawless 5-star experience from start to finish!",
  "Absolutely incredible! We booked this somewhat last minute after a friend recommended it, and it turned out to be the best decision of our vacation. The communication beforehand was prompt and clear, so we knew exactly what to expect. On the day of the tour, every single detail was taken care of. We got to see some of the most breathtaking landscapes I've ever witnessed, and our guide even helped us take some phenomenal photos that we will cherish forever. The whole experience felt very VIP and personalized. If you're hesitant about booking, don't be. This is the gold standard for tours in Bali.",
  "What a spectacular day! My family and I were blown away by the level of service we received. Traveling with kids can sometimes be stressful, but our guide was incredibly patient, accommodating, and knew exactly how to keep everyone engaged. The sights were absolutely stunning, and the local lunch spot they recommended was out of this world—authentic, delicious, and very reasonably priced. We learned so much about Balinese culture and traditions that we never would have discovered on our own. We felt like we were being shown around by a good friend rather than a tour guide. 10/10, would book again in a heartbeat!",
  "Perfection from beginning to end! I had high expectations based on the description, but the actual experience completely blew them out of the water. Our guide arrived early, greeted us with cold water and big smiles, and the day just kept getting better from there. Every stop was perfectly timed to avoid the massive crowds, which meant we got to enjoy the serenity of the locations. The attention to detail was incredible. They truly care about providing a premium, memorable experience. We left feeling relaxed, inspired, and deeply in love with Bali. Do yourself a favor and book this immediately!",
  "An unforgettable adventure! This tour was everything we hoped for and more. The booking process was super smooth, and the team was highly responsive to all our questions. On the actual day, our guide was a superstar—friendly, energetic, and a wealth of local knowledge. They took us to some incredible spots that weren't swarming with tourists, giving us a very authentic and intimate experience. The transportation was extremely comfortable, and we were always provided with refreshing cold towels and water after walking around. It's rare to find a service that delivers on every single promise, but these guys nailed it. Five stars all the way!",
  "If I could give this 6 stars, I would! We’ve taken many tours around Southeast Asia, but this one truly stands out as exceptional. The itinerary was perfectly crafted, allowing us to see all the major highlights without ever feeling like we were just checking boxes. Our guide was incredibly charismatic, speaking excellent English and sharing deep insights into the local way of life. The vehicle was luxurious and spotless. We felt incredibly well taken care of throughout the entire journey. This company genuinely understands what makes a tour special—it’s not just about the destinations, it’s about the people and the experience. Phenomenal job!",
  "A truly magical experience! We booked this for our honeymoon and couldn't have asked for a better day. The team went above and beyond to make it special for us. The sights were stunning, the pacing was very relaxed, and our guide was the perfect blend of informative and respectful of our privacy. We felt like VIPs all day long. They even knew the best angles for photos and took some amazing shots of us! The entire operation is so professional, yet it retains that beautiful, warm Balinese hospitality. We will be recommending this to all our friends and family back home. Thank you for an amazing day!",
  "Exceeded every single expectation! From the easy booking process to the final drop-off, everything was flawless. Our guide was incredibly thoughtful, tailoring the pace of the day to suit our group perfectly. We learned so much about the rich history and culture of Bali, making the beautiful sights even more meaningful. The transport was top-notch, very comfortable and safe. It's very clear that this company takes immense pride in what they do. You get absolute premium service for a very fair price. If you want a hassle-free, deeply enriching, and visually stunning day in Bali, look no further.",
  "Simply the best tour we've ever been on! Everything was orchestrated perfectly. Our driver was extremely punctual, the car was spotless, and the AC was a blessing. Our guide was a true gem—hilarious, kind, and incredibly knowledgeable. We got to avoid the biggest crowds because our guide knew exactly when to visit each spot. The natural beauty of the locations left us speechless, and the cultural insights provided by our guide added so much depth to the experience. We felt completely safe and well-cared-for the entire time. I cannot praise this experience enough. A massive thank you to the whole team for a perfect day!"
];

const names = [
  "John D.", "Sarah M.", "David W.", "Emma S.", "Michael R.",
  "Jessica T.", "Chris P.", "Amanda K.", "James H.", "Olivia C.",
  "Daniel L.", "Sophia B.", "Matthew G.", "Isabella N.", "Andrew V.",
  "Mia F.", "Joshua E.", "Charlotte A.", "Kevin O.", "Amelia Y.",
  "Ryan J.", "Harper U.", "Jacob Q.", "Evelyn I.", "Nicholas Z.",
  "Anna P.", "William T.", "Liam S.", "Lucas C.", "Oliver M.",
  "Thomas W.", "Emily R.", "Chloe S.", "Ava K.", "Marcus B.",
  "Elena R.", "Sebastian K.", "Victoria M.", "Gabriel S.", "Lily J."
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
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - getRandomInt(1, 365));

    reviews.push({
      id: Date.now().toString() + i + Math.random().toString().substring(2, 8),
      user: getRandomItem(names),
      userImage: null,
      rating: 5, // Strictly 5.0 stars as requested
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

  console.log(`Found ${listings.length} listings. Replacing existing reviews with new long 5.0 reviews...`);

  for (const listing of listings) {
    const dataObj = listing.data || {};
    
    // Clear the existing reviews entirely
    const numNewReviews = getRandomInt(25, 50);
    const newReviews = generateReviews(numNewReviews);
    
    // Set strictly to the new 5.0 reviews
    dataObj.reviewsList = newReviews;

    const totalReviews = newReviews.length;
    const newAverage = 5.0; // Since all are 5 stars, average is strictly 5.0

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
      console.log(`Successfully replaced reviews with ${numNewReviews} new 5.0 star reviews for listing ${listing.id}. Avg Rating: 5.0`);
    }
  }

  console.log("Done seeding reviews.");
}

seedReviews();
