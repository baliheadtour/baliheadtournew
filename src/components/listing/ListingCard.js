"use client";

import React, { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export default function ListingCard({ item, linkTo }) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.email && item?.id) {
       const checkSaved = async () => {
          const { data } = await supabase
            .from('bookings')
            .select('id')
            .eq('details->>isWishlist', 'true')
            .eq('details->>customer_email', session.user.email)
            .eq('details->item->>id', item.id)
            .single();
          if (data) setIsSaved(true);
       };
       checkSaved();
    }
  }, [session, item]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session?.user) {
      signIn('google');
      return;
    }
    
    if (isSaving || !item) return;
    setIsSaving(true);
    
    try {
      if (isSaved) {
        await supabase
          .from('bookings')
          .delete()
          .eq('details->>isWishlist', 'true')
          .eq('details->>customer_email', session.user.email)
          .eq('details->item->>id', item.id);
        setIsSaved(false);
      } else {
        await supabase.from('bookings').insert({
          id: `FAV-${Date.now()}`,
          customer_name: session.user.name || session.user.email,
          contact_info: session.user.email,
          service_name: item.title,
          booking_date: new Date().toISOString().split('T')[0],
          amount: "0",
          status: 'Pending',
          category: 'Tour',
          details: { customer_email: session.user.email, item: item, image: item.image, isWishlist: true }
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getFormattedPrice = (rawPrice) => {
    const p = Number(rawPrice);
    return Math.floor(p > 1000 ? p : p * 1000);
  };

  let basePriceToUse = item.price;
  if (!basePriceToUse || basePriceToUse == 0) {
      const dataObj = item.data || item || {};
      const tiersToUse = (dataObj.tourTiers && dataObj.tourTiers.length > 0) ? dataObj.tourTiers : ((dataObj.allInclusiveTiers && dataObj.allInclusiveTiers.length > 0) ? dataObj.allInclusiveTiers : []);
      const validTiers = tiersToUse.filter(t => t.price && Number(String(t.price).replace(/[^0-9]/g, '')) > 0);
      if (validTiers.length > 0) {
          validTiers.sort((a, b) => Number(a.pax) - Number(b.pax));
          const minTier = validTiers[0];
          let priceNum = Number(String(minTier.price).replace(/[^0-9]/g, ''));
          if (dataObj.pricingType !== "Per Group") {
             priceNum = priceNum / (Number(minTier.pax) || 1);
          }
          basePriceToUse = priceNum;
      } else if (dataObj.allInclusiveSurcharge) {
          basePriceToUse = Number(String(dataObj.allInclusiveSurcharge).replace(/[^0-9]/g, ''));
      }
  }

  const cleanBasePrice = Number(String(basePriceToUse || 0).replace(/[^0-9]/g, ''));
  const formattedPrice = `IDR ${getFormattedPrice(cleanBasePrice).toLocaleString('id-ID')}`;

  if (item.service === "Spa") {
    // Determine the prices to show
    const prices = [];
    if (item.min60) prices.push({ label: '60 Min', price: item.min60 });
    if (item.min90) prices.push({ label: '90 Min', price: item.min90 });
    if (item.min120) prices.push({ label: '120 Min', price: item.min120 });
    
    // Fallback price logic if no explicit durations are found
    if (prices.length === 0) prices.push({ label: 'Starts at', price: item.price });
    
    const displayPrice = prices.length > 0 ? prices[0] : null;

    return (
      <Link href={linkTo} className="flex flex-col w-full bg-[#fdfbf7] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0ede6] group transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] outline-none">
        
        {/* Spa Image Section */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#E8E6DF] shrink-0">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.title || "Spa Image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-[12s] ease-out group-hover:scale-110 opacity-95 group-hover:opacity-100 mix-blend-multiply" 
            />
          ) : (
            <div className="absolute inset-0 bg-[#E8E6DF] w-full h-full"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          {/* Badge */}
          {item.spaSetting && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-block px-3 py-1.5 bg-[#A48F7A]/95 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm rounded-xl border border-white/20">{item.spaSetting}</span>
            </div>
          )}

          {/* Heart Favorite Button */}
          <button 
            onClick={handleSave} 
            className="absolute top-4 right-4 w-[36px] h-[36px] bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#A48F7A] shadow-sm z-10 transition-all active:scale-90 hover:bg-white hover:text-red-500"
          >
            <Heart size={18} strokeWidth={2.5} className={isSaved ? "text-red-500 fill-red-500" : ""} />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col p-5 pt-5 flex-1">
          {/* Location & Category */}
          <div className="text-[10px] font-black tracking-[0.2em] text-[#C1A88A] uppercase mb-1.5 truncate">
            Wellness • {item.location || "Bali"}
          </div>
          
          {/* Title */}
          <h3 className="font-extrabold text-[18px] leading-[1.3] text-[#3d3730] line-clamp-2 mb-2 group-hover:text-[#A48F7A] transition-colors font-serif">
            {item.title}
          </h3>
          
          {/* Short description / Benefit */}
          <p className="text-[12px] font-medium text-[#8F8F99] line-clamp-2 mb-4 leading-relaxed">
             {item.description || item.highlights || item.included || "Experience deep relaxation and rejuvenation with our bespoke spa therapies."}
          </p>

          {/* Footer (Price + Button) */}
          <div className="mt-auto pt-4 flex items-end justify-between gap-2 border-t border-[#f0ede6]">
            <div className="flex flex-col justify-end">
              {displayPrice && (
                 <>
                   <span className="text-[10px] font-bold text-[#C1A88A] uppercase tracking-widest mb-0.5">{displayPrice.label}</span>
                   <div className="flex items-end gap-1">
                     <span className="font-extrabold text-[15px] sm:text-[16px] text-[#3d3730] tracking-tight leading-none">
                       {`IDR ${getFormattedPrice(displayPrice.price).toLocaleString('id-ID')}`}
                     </span>
                   </div>
                 </>
              )}
            </div>
            <button className="text-[12px] font-extrabold text-white bg-[#A48F7A] px-5 py-2.5 rounded-xl shrink-0 shadow-sm transition-transform active:scale-95 group-hover:bg-[#8e7a67]">
              Reserve
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Standard Tour/Listing Return
  return (
    <Link href={linkTo} className="flex flex-col w-full bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] block outline-none">
      
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F4F4F6] shrink-0">
        {item.image && (
          <Image 
            src={item.image} 
            alt={item.title || "Tour Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-[10s] ease-out group-hover:scale-110" 
          />
        )}
        
        {/* Badge */}
        {item.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block px-3 py-1.5 bg-white/95 backdrop-blur-md text-primary text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm rounded-xl border border-white/40">{item.badge}</span>
          </div>
        )}

        {/* Heart Favorite Button */}
        <button 
          onClick={handleSave} 
          className="absolute top-4 right-4 w-[36px] h-[36px] bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-text-secondary/80 shadow-sm z-10 transition-all group-hover:opacity-100 active:scale-90 hover:bg-white hover:text-red-500"
        >
          <Heart size={18} strokeWidth={2.5} className={isSaved ? "text-red-500 fill-red-500" : ""} />
        </button>
      </div>
      
      {/* Content Section */}
      <div className="flex flex-col p-5 pt-4 flex-1">
        {/* Location & Category (GyG style subtitle) */}
        <div className="text-[11px] font-extrabold tracking-widest text-[#8F8F99] uppercase mb-1.5 truncate">
          {item.service || "Tour"} • {item.location || "Bali"}
        </div>
        
        {/* Title */}
        <h3 className="font-extrabold text-[16px] leading-[1.3] text-primary line-clamp-2 mb-2 group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-1 mb-4">
          <Star size={13} strokeWidth={2.5} className="fill-[#F59E0B] text-[#F59E0B] pb-[0.5px]" />
          <span className="text-[13px] font-bold text-primary">{Number(item.rating || 5).toFixed(1)}</span>
          <span className="text-[13px] font-semibold text-text-secondary">({item.reviews || 0} reviews)</span>
        </div>

        {/* Footer (Price + Button/Date) */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-gray-100/80">
          <div className="flex flex-col justify-end">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">From</span>
            <div className="flex items-end gap-1">
              <span className="font-extrabold text-[17px] text-primary tracking-tight leading-none">
                {formattedPrice}
              </span>
            </div>
          </div>
          <button className="text-[13px] font-extrabold text-primary bg-accent px-4 py-2 rounded-xl shrink-0 shadow-sm transition-transform active:scale-95 group-hover:scale-105">
            Book
          </button>
        </div>
      </div>
    </Link>
  );
}

