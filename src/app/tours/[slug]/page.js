import { supabase } from "@/lib/supabase";
import { getActiveListings } from "@/lib/cache";
import TourDetailClient from "./TourDetailClient";
import { generateSlug } from "@/lib/utils";
import StructuredData from "@/components/seo/StructuredData";
import { getSeoDescription, generateTourJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // We need to fetch all active tours and find the one that matches the slug
  const allListings = await getActiveListings();
  
  const listing = allListings?.find(item => generateSlug(item.title) === slug) || 
                  allListings?.find(item => item.id === slug); // fallback for direct UUIDs
                  
  if (!listing) {
    return {
      title: "Tour Not Found | Discovering Bali",
      description: "This tour could not be found."
    };
  }

  const defaultImg = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
  const coverImg = listing.image || defaultImg;
  const optimizedDescription = getSeoDescription(listing.data?.description || listing.data?.highlights || "");

  return {
    title: `${listing.title} | Discovering Bali`,
    description: optimizedDescription,
    openGraph: {
      title: listing.title,
      description: optimizedDescription,
      images: [
        {
          url: coverImg,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: optimizedDescription,
      images: [coverImg],
    },
  };
}

export const revalidate = 3600; // Cache on server for 1 hour

export async function generateStaticParams() {
  const listings = await getActiveListings();
  
  if (!listings) return [];

  return listings.map((listing) => ({
    slug: generateSlug(listing.title),
  }));
}

export const dynamicParams = true;

export default async function TourPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const allListings = await getActiveListings();
  
  let data = allListings?.find(item => generateSlug(item.title) === slug);
  if (!data) {
     // fallback if they visit via ID directly
     data = allListings?.find(item => item.id === slug);
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-black text-primary mb-2">Tour Not Found</h1>
        <p className="font-bold text-text-secondary">The tour you are looking for does not exist.</p>
      </div>
    );
  }

  const frontendObj = {
     id: data.id,
     service: data.type,
     title: data.title,
     location: data.location,
     price: data.price,
     duration: data.duration,
     category: data.category,
     rating: data.rating,
     reviews: data.reviews,
     status: data.status,
     image: data.image,
     company: data.company_name,
     ...(data.data || {})
  };

  const defaultImg = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
  const coverImg = frontendObj.image || defaultImg;
  const validGallery = (frontendObj.gallery || []).filter(img => img && img.trim() !== "");
  
  const fallbackGallery = [
     "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1554481923-a6918bd997bc?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1610486829777-66a96e949cb3?auto=format&fit=crop&w=800&q=80"
  ];

  let allImages = [coverImg, ...validGallery];
  if (allImages.length < 5) {
     const needed = 5 - allImages.length;
     allImages = [...allImages, ...fallbackGallery.slice(0, needed)];
  }
  frontendObj.images = allImages;
  
  let calculatedMinPax = 1;
  if (frontendObj.pricingType === "Per Person" && frontendObj.tourTiers && frontendObj.tourTiers.length > 0) {
     const validTiers = frontendObj.tourTiers.filter(t => t.price && Number(t.price) > 0);
     if (validTiers.length > 0) {
        calculatedMinPax = Math.min(...validTiers.map(t => Number(t.pax)));
     }
  }
  frontendObj.minPax = calculatedMinPax;

  // Compute Related Tours
  const relatedTours = allListings
     ?.filter(item => item.type === data.type && item.id !== data.id)
     .slice(0, 4)
     .map(item => ({
        id: item.id,
        service: item.type,
        title: item.title,
        location: item.location,
        price: item.price,
        duration: item.duration,
        category: item.category,
        rating: item.rating,
        reviews: item.reviews,
        status: item.status,
        image: item.image,
        company: item.company_name,
        ...(item.data || {})
     })) || [];

  const jsonLd = generateTourJsonLd(frontendObj);

  return (
    <>
      <StructuredData data={jsonLd} />
      <TourDetailClient tourData={frontendObj} slug={slug} relatedTours={relatedTours} />
    </>
  );
}
