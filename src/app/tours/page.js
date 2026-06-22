import React from "react";
import ListingCard from "@/components/listing/ListingCard";
import UniversalSearchBar from "@/components/search/UniversalSearchBar";
import { Filter, ChevronDown, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getActiveListings } from "@/lib/cache";
import { generateSlug } from "@/lib/utils";

export const revalidate = 3600; // Cache on server for 1 hour


const SidebarFilter = ({ title, options }) => (
  <div className="mb-6 border-b border-border pb-6 last:border-0 last:pb-0">
    <h3 className="font-bold mb-4">{title}</h3>
    <div className="flex flex-col gap-3">
      {options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-5 h-5 rounded border border-border flex items-center justify-center group-hover:border-accent transition-colors text-white bg-transparent">
            {/* Checked icon placeholder */}
          </div>
          <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{opt.label}</span>
          {opt.count && <span className="ml-auto text-xs text-text-secondary bg-background px-2 py-0.5 rounded-full">{opt.count}</span>}
        </label>
      ))}
    </div>
  </div>
);

export default async function Tours() {
  const allListings = await getActiveListings();
  const tours = allListings
    .filter(t => t.type === 'Tour')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const displayTours = tours || [];

  const categoryCounts = { "Adventure": 0, "Water": 0, "Nature": 0, "Culture": 0 };
  const locationCounts = { "Ubud": 0, "Nusa Penida": 0, "Kuta": 0, "Seminyak": 0, "Canggu": 0, "Uluwatu": 0, "Bedugul": 0 };

  displayTours.forEach(tour => {
     const cat = tour.category || tour.data?.category;
     if (cat && categoryCounts[cat] !== undefined) categoryCounts[cat]++;
     
     const locRaw = (tour.location || tour.data?.location || "").toLowerCase();
     if (locRaw.includes('ubud')) locationCounts["Ubud"]++;
     else if (locRaw.includes('nusa penida')) locationCounts["Nusa Penida"]++;
     else if (locRaw.includes('kuta') && !locRaw.includes('kuta sel') && !locRaw.includes('kuta utara')) locationCounts["Kuta"]++;
     else if (locRaw.includes('seminyak')) locationCounts["Seminyak"]++;
     else if (locRaw.includes('canggu')) locationCounts["Canggu"]++;
     else if (locRaw.includes('uluwatu')) locationCounts["Uluwatu"]++;
     else if (locRaw.includes('bedugul') || locRaw.includes('ulun danu')) locationCounts["Bedugul"]++;
  });

  return (
    <div className="w-full bg-background min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:max-w-7xl">
        
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Bali Tours</h1>
          <p className="text-text-secondary mb-8">Discover and book the most epic adventures on the island.</p>
          <div className="bg-surface p-2 rounded-3xl shadow-sm mb-8 inline-block max-w-full lg:min-w-[800px]">
            <UniversalSearchBar />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-surface rounded-2xl border border-border shadow-soft p-5 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-lg border-b border-border pb-4 mb-4">
                <Filter size={20} />
                <span>Filters</span>
              </div>
              
              <SidebarFilter 
                title="Category" 
                options={[
                  { label: "Adventure", count: categoryCounts["Adventure"] },
                  { label: "Water", count: categoryCounts["Water"] },
                  { label: "Nature", count: categoryCounts["Nature"] },
                  { label: "Culture", count: categoryCounts["Culture"] },
                ]} 
              />
              
              <SidebarFilter 
                title="Location" 
                options={[
                  { label: "Ubud", count: locationCounts["Ubud"] },
                  { label: "Nusa Penida", count: locationCounts["Nusa Penida"] },
                  { label: "Kuta", count: locationCounts["Kuta"] },
                  { label: "Seminyak", count: locationCounts["Seminyak"] },
                  { label: "Canggu", count: locationCounts["Canggu"] },
                  { label: "Uluwatu", count: locationCounts["Uluwatu"] },
                  { label: "Bedugul", count: locationCounts["Bedugul"] },
                ]} 
              />

              <button className="w-full rounded-full bg-primary text-white font-medium py-3 hover:bg-black/80 transition-colors shadow-md mt-2">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-text-secondary text-sm">Showing {displayTours.length} Tours</span>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Sort by:</span>
                <button className="flex items-center gap-1 text-sm font-semibold bg-surface px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                  Recommended <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTours.map(tour => (
                <ListingCard key={tour.id} item={tour} linkTo={`/tours/${generateSlug(tour.title)}`} />
              ))}
            </div>
            
            <div className="mt-12 flex justify-center">
              <button className="rounded-full bg-surface text-text-primary px-8 py-3 border border-border hover:bg-surface-hover font-semibold transition-colors shadow-sm">
                Load More Experiences
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
