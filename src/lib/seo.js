import { generateSlug } from "./utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.bobbybaliguide.com';

export function getSeoDescription(text, maxLength = 160) {
  if (!text) return "Book your premium Bali experience with Discovering Bali.";
  // Strip HTML
  let cleanText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength - 3) + '...';
}

export function generateTourJsonLd(tour) {
  let minPrice = tour.price || 0;
  if (tour.pricingType === "Per Person" && tour.tourTiers && tour.tourTiers.length > 0) {
    const validTiers = tour.tourTiers.filter(t => t.price && Number(t.price) > 0);
    if (validTiers.length > 0) {
      minPrice = Math.min(...validTiers.map(t => Number(t.price)));
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': tour.title,
    'description': getSeoDescription(tour.data?.description || tour.data?.highlights || ""),
    'image': tour.image || `${BASE_URL}/logo.png`,
    'touristType': [
      'Families', 'Couples', 'Solo travelers'
    ],
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Discovering Bali',
      'url': BASE_URL
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR',
      'price': minPrice,
      'availability': 'https://schema.org/InStock',
      'url': `${BASE_URL}/tours/${generateSlug(tour.title)}`
    }
  };

  if (tour.rating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': tour.rating,
      'reviewCount': tour.reviews || 10
    };
  }

  return JSON.stringify(jsonLd);
}

export function generateBlogJsonLd(blog) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'image': blog.image || `${BASE_URL}/logo.png`,
    'datePublished': blog.created_at,
    'dateModified': blog.updated_at || blog.created_at,
    'author': {
      '@type': 'Person',
      'name': blog.author || 'Discovering Bali Team'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Discovering Bali',
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/logo.png`
      }
    },
    'description': getSeoDescription(blog.meta_description || blog.content)
  };

  return JSON.stringify(jsonLd);
}

export function injectSmartLinks(html, toursList) {
  if (!html || !toursList || toursList.length === 0) return html;
  
  let newHtml = html;
  // Sort by length descending to match longest phrases first to prevent partial matches
  const sortedTours = [...toursList].sort((a, b) => b.title.length - a.title.length);

  for (const tour of sortedTours) {
    if (tour.title.length < 5) continue; // Skip very short generic words
    
    // Clean up the tour title to remove "Tour" or "Adventure" if needed to match better in blogs
    // For now we match the exact title or the title without the word "Tour"
    const cleanTitle = tour.title.replace(/\s+Tour$/i, '').trim();
    if (cleanTitle.length < 5) continue;

    const slug = generateSlug(tour.title);
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match either any HTML tag OR the exact keyword
    const regex = new RegExp(`(<[^>]+>)|\\b(${escapeRegExp(cleanTitle)})\\b`, 'gi');
    
    let alreadyLinked = false;
    let replacementCount = 0;

    newHtml = newHtml.replace(regex, (match, tag, keyword) => {
      if (tag) {
         if (/^<a\s/i.test(tag)) alreadyLinked = true;
         if (/^<\/a>/i.test(tag)) alreadyLinked = false;
         return match;
      }
      // Only link the first occurrence per tour to avoid spamming links
      if (keyword && !alreadyLinked && replacementCount === 0) {
         replacementCount++;
         return `<a href="/tours/${slug}" class="text-accent font-bold hover:underline transition-all" title="View ${tour.title} Tour">${keyword}</a>`;
      }
      return match;
    });
  }
  return newHtml;
}
