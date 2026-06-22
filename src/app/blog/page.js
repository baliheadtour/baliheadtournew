import React from "react";
import Image from "next/image";
import { ChevronRight, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const metadata = {
  title: "Discover Bali | Premium Island Blog",
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to strip HTML and get excerpt
const getExcerpt = (html, length = 120) => {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '');
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Helper to reliably construct blog URLs
const getBlogUrl = (slug) => {
  if (!slug) return '/blog';
  const cleanSlug = slug.replace(/^\/?(blog\/)?/, '');
  return `/blog/${cleanSlug}`;
};

export const revalidate = 3600; // Server-side caching for 1 hour

export default async function Blog() {
  const { data: dbArticles, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'Published')
    .order('created_at', { ascending: false });

  const articles = dbArticles || [];

  return (
    <div className="w-full bg-background min-h-screen font-sans">
      
      {/* Cinematic Header */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-black flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent"></div>
        <div className="relative z-10 max-w-3xl mt-16">
          <span className="text-accent font-extrabold uppercase tracking-[0.2em] text-sm mb-4 block">Travel Journal</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-xl">Discover Bali</h1>
          <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Insider guides, hidden gems, and inspiration from local experts to help you plan the perfect trip.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:max-w-7xl -mt-12 md:-mt-16 relative z-20 pb-24">
        {articles.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-[32px] border border-border shadow-floating">
            <Sparkles size={48} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-3xl font-black text-primary mb-3">More Content Coming Soon</h3>
            <p className="text-text-secondary text-lg font-medium">We are currently crafting amazing new articles for you.</p>
          </div>
        ) : (
          <>
            {/* Featured Cinematic Article */}
            <Link href={getBlogUrl(articles[0].slug)} className="group bg-surface rounded-[32px] overflow-hidden shadow-floating border border-border mb-16 flex flex-col md:flex-row cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl block">
              <div className="md:w-3/5 relative overflow-hidden aspect-[4/3] md:aspect-auto bg-gray-100">
                {articles[0].image ? (
                  <Image src={articles[0].image} alt={articles[0].title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-white/10 text-6xl font-black">DISCOVER BALI</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 md:opacity-0 transition-opacity duration-300"></div>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-primary shadow-lg tracking-widest uppercase">
                  Featured
                </div>
              </div>
              
              <div className="md:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
                <span className="text-accent font-extrabold text-sm tracking-widest uppercase mb-4">{articles[0].category || 'Guides'}</span>
                <h2 className="text-3xl lg:text-5xl font-black mb-6 text-primary group-hover:text-amber-500 transition-colors leading-[1.1]">{articles[0].title}</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-4 font-medium">{articles[0].meta_description || getExcerpt(articles[0].content)}</p>
                <div className="flex items-center justify-between text-sm font-bold mt-auto pt-6 border-t border-gray-100">
                  <span className="flex items-center gap-2 text-gray-400"><Calendar size={18}/> {new Date(articles[0].created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  <span className="text-primary group-hover:text-accent font-black flex items-center group-hover:translate-x-2 transition-transform uppercase tracking-wider">Read Full <ChevronRight size={20} className="ml-1" /></span>
                </div>
              </div>
            </Link>

            {articles.length > 1 && (
              <>
                <div className="flex items-center gap-4 mb-10">
                   <h2 className="text-3xl lg:text-4xl font-black text-primary">Latest Articles</h2>
                   <div className="h-0.5 flex-1 bg-gray-200 mt-2"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.slice(1).map((article) => (
                    <Link key={article.id} href={getBlogUrl(article.slug)} className="bg-surface border border-border rounded-[24px] shadow-soft flex flex-col group cursor-pointer hover:shadow-floating hover:-translate-y-2 transition-all duration-500 overflow-hidden block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {article.image ? (
                          <Image src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                           <div className="w-full h-full bg-black flex items-center justify-center text-white/10 text-3xl font-black">DB</div>
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-white shadow-sm tracking-widest uppercase border border-white/10">
                          {article.category || 'Guides'}
                        </div>
                      </div>
                      
                      <div className="p-6 lg:p-8 flex flex-col flex-1 bg-white relative">
                        <h3 className="text-2xl font-black mb-3 line-clamp-2 text-primary group-hover:text-amber-500 transition-colors leading-[1.2]">{article.title}</h3>
                        <p className="text-sm font-medium text-gray-500 mb-8 line-clamp-3 leading-relaxed">{article.meta_description || getExcerpt(article.content)}</p>
                        
                        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-400">{new Date(article.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          <span className="text-primary group-hover:text-accent font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest text-xs">Read <ChevronRight size={16}/></span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
