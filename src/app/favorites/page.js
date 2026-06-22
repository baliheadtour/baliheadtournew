"use client";

import React, { useState, useEffect } from "react";
import { Heart, Search } from "lucide-react";
import WishlistCard from "@/components/listing/WishlistCard";
import { useSession, signIn } from "next-auth/react";
import { generateSlug } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clear persistent cache on mount so new payload data works in admin (Dev hack only)
  useEffect(() => {
    localStorage.removeItem("bali_bookings");
    localStorage.removeItem("bali_dashboard");
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
       signIn('google');
    } else if (session?.user?.email) {
       fetchFavorites(session.user.email);
    }
  }, [session, status]);

  const fetchFavorites = async (email) => {
     try {
       const { data, error } = await supabase
         .from('bookings')
         .select('*')
         .eq('details->>isWishlist', 'true')
         .eq('details->>customer_email', email)
         .order('created_at', { ascending: false });
       
       if (data) {
          const parsedFavorites = data.map(b => b.details?.item).filter(Boolean);
          setFavorites(parsedFavorites);
       }
     } catch (err) {
       console.error("Failed to fetch favorites:", err);
     } finally {
       setLoading(false);
     }
  };

  if (status === "loading" || loading) {
     return <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8FAFC]"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div></div>;
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-32 font-sans">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-[#1C1C1E] mb-6 tracking-tight">Saved Trips</h1>
        
        <div className="bg-white rounded-2xl flex gap-3 items-center px-5 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E8EAEF] mb-8">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your favorites..." 
            className="flex-1 outline-none font-bold text-[14px] bg-transparent text-[#1C1C1E] placeholder:text-gray-400 placeholder:font-medium"
          />
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Heart size={32} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-primary mb-2">No saved trips yet</h3>
             <p className="text-gray-500 font-medium">When you see a trip you like, click the heart icon to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((tour) => (
              <WishlistCard key={tour.id} item={tour} linkTo={`/tours/${generateSlug(tour.title)}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
