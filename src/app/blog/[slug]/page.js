import React from 'react';
import { ArrowLeft, MapPin, Share2, Calendar, Eye, Sparkles, UserCircle, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import StructuredData from '@/components/seo/StructuredData';
import { getSeoDescription, generateBlogJsonLd, injectSmartLinks } from '@/lib/seo';
import { generateSlug } from '@/lib/utils';

const formatContent = (htmlOrText) => {
  if (!htmlOrText) return '<p>No content available for this article yet.</p>';

  // If it already contains explicit structural HTML, trust the user's formatting
  if (/<(p|h[1-6]|ul|ol|div|br)[^>]*>/i.test(htmlOrText)) {
    return htmlOrText;
  }

  // SMART AUTO-FORMATTER FOR PASTE
  let html = '';
  let inList = false;
  let expectList = false;

  // Convert basic markdown bold to HTML
  let processedText = htmlOrText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Split by newlines, keep empty lines to detect paragraph breaks!
  const lines = processedText.split('\n').map(l => l.trim());

  lines.forEach((line, index) => {
    if (line.length === 0) {
      // A blank line breaks an implicit list
      if (inList && expectList) expectList = false;
      return;
    }

    // Detect explicit List Items (bullets or numbers)
    const listMatch = line.match(/^([-*]|\d+\.)\s+(.*)$/);

    // Clean line for evaluation
    const cleanLine = line.replace(/<\/?strong>/g, '');
    const isBoldedLine = line.startsWith('<strong>') && line.endsWith('</strong>');

    let isListItem = false;
    let content = line;

    if (listMatch) {
      isListItem = true;
      content = listMatch[2];
    } else if (expectList && !isBoldedLine) {
      isListItem = true;
    }

    if (isListItem) {
      if (!inList) {
        // Use a beautiful custom styled list
        html += '<ul class="space-y-3 my-6 pl-2">';
        inList = true;
      }
      // Automatically bold text before a colon in a list item
      content = content.replace(/^([^:]+):/, '<strong>$1:</strong>');
      html += `<li class="flex items-start gap-3"><div class="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div><span class="flex-1">${content}</span></li>`;
      return;
    } else if (inList) {
      html += '</ul>';
      inList = false;
    }

    if (isBoldedLine) {
      if (index === 0 || html.indexOf('<h2') === -1) {
        html += `<h2>${cleanLine}</h2>`;
      } else {
        html += `<h3>${cleanLine}</h3>`;
      }
      expectList = false; // Reset implicit list detection
    } else {
      if (cleanLine.endsWith(':')) {
        expectList = true; // The next lines are an implicit list!
        html += `<p class="font-bold text-xl text-primary mt-8 mb-4">${line}</p>`;
      } else {
        expectList = false;
        html += `<p>${line}</p>`;
      }
    }
  });

  if (inList) html += '</ul>';

  return html;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: post } = await supabase
    .from('blogs')
    .select('title, meta_description, content, image')
    .or(`slug.eq.${slug},slug.eq./blog/${slug},slug.eq.blog/${slug}`)
    .single();

  if (!post) {
    return {
      title: "Article Not Found | Discovering Bali",
      description: "This article could not be found."
    };
  }

  const optimizedDescription = getSeoDescription(post.meta_description || post.content);
  const coverImg = post.image || "";

  return {
    title: `${post.title} | Discovering Bali Blog`,
    description: optimizedDescription,
    openGraph: {
      title: post.title,
      description: optimizedDescription,
      images: [{ url: coverImg, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: optimizedDescription,
      images: [coverImg],
    },
  };
}

export default async function BlogDetail({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: post } = await supabase
    .from('blogs')
    .select('title, category, location, created_at, content, image, meta_description')
    .or(`slug.eq.${slug},slug.eq./blog/${slug},slug.eq.blog/${slug}`)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-3xl font-extrabold text-primary mb-4">Article Not Found</h1>
        <p className="text-text-secondary mb-8 font-medium">The recommended place you are looking for does not exist or has been removed.</p>
        <Link href="/" className="px-8 py-3 bg-accent text-primary font-bold rounded-full hover:scale-105 transition-transform">
          Return Home
        </Link>
      </div>
    );
  }

  // Fetch all active listings for Smart Internal Linking
  const { data: allListings } = await supabase.from('listings').select('title, id').eq('status', 'Active');

  const formattedHtml = formatContent(post.content);
  const smartLinkedHtml = injectSmartLinks(formattedHtml, allListings || []);
  const jsonLd = generateBlogJsonLd(post);

  return (
    <>
      <StructuredData data={jsonLd} />
      <main className="min-h-screen bg-background pb-32 font-sans">

        {/* Hero Header Section */}
        <div className="relative w-full h-[50vh] md:h-[65vh] bg-black">
          {post.image && <Image src={post.image} alt={post.title} fill sizes="100vw" priority className="absolute inset-0 w-full h-full object-cover opacity-80" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30"></div>

          {/* Top Navigation Bar */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20">
            <Link href="/blog" className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/10 shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <button className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/10 shadow-sm">
              <Share2 size={18} />
            </button>
          </div>

          {/* Title / Meta Area */}
          <div className="absolute bottom-6 md:bottom-12 inset-x-6 md:inset-x-12 z-20 flex flex-col md:w-[70%]">
            <span className="inline-flex w-fit px-3 py-1 bg-accent text-primary text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-sm rounded-[8px] mb-4">
              {post.category || 'Featured'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-4 drop-shadow-lg tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-semibold">
              <div className="flex items-center gap-1.5 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                <MapPin size={14} className="text-accent" />
                <span>{post.location}</span>
              </div>
              <div className="flex items-center gap-1.5 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                <Calendar size={14} className="text-gray-300" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with Newsletter Vibe */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 md:pt-16 pb-12">
          {/* Formatted Smart Body */}
          <div
            className="newsletter-content"
            dangerouslySetInnerHTML={{ __html: smartLinkedHtml }}
          />
        </div>

        {/* Masonry Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 md:px-12 mt-16 mb-8">
            <h3 className="text-2xl font-black text-primary mb-6">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {post.images.map((img, idx) => (
                <div key={idx} className={`relative rounded-2xl overflow-hidden shadow-sm aspect-square ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <Image src={img} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" alt="Gallery item" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta Summary Bottom */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-border">
          <h4 className="font-bold text-primary mb-2">Description</h4>
          <p className="text-sm font-medium text-text-secondary italic">"{post.meta_description || 'No description available.'}"</p>
        </div>

      </main>
    </>
  );
}
