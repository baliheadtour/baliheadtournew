import React from "react";
import { Heart, Star, MapPin, Bookmark } from "lucide-react";
import Link from "next/link";

export default function WishlistCard({ item, linkTo }) {
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
  const isIdr = cleanBasePrice >= 1000;
  const formattedPrice = isIdr ? `IDR ${cleanBasePrice.toLocaleString('id-ID')}` : `$${cleanBasePrice}`;

  return (
    <Link href={linkTo} className="relative flex flex-col w-full aspect-[4/5] sm:aspect-square overflow-hidden rounded-[32px] group block w-full outline-none transform transition-transform duration-300 hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.06)] active:scale-[0.98]">
      
      {/* Background Image Full Bleed */}
      <img 
        src={item.image} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110" 
        alt={item.title} 
      />

      {/* Top Gradient Overlay for Header contrast (Badge / Heart) */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
      
      {/* Top Elements */}
      <div className="absolute top-5 inset-x-5 flex justify-between items-start z-20">
         {/* Badge variant */}
         {item.badge ? (
           <span className="inline-block px-3.5 py-1.5 bg-black/30 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/20 shadow-sm">{item.badge}</span>
         ) : (
           <span className="inline-block px-3.5 py-1.5 bg-black/30 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/20 shadow-sm">{item.category || item.service}</span>
         )}

         {/* Heart Solid Red (Since it's in wishlist) */}
         <button className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-red-500 shadow-sm z-30 transition-all active:scale-90 border border-white/30">
           <Heart size={20} className="fill-red-500" />
         </button>
      </div>
      
      {/* Bottom Content Frosted Glass Pane - Apple Style */}
      <div className="absolute bottom-3 inset-x-3 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-5 flex flex-col z-20 shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 group-hover:bg-white/90">
        
        {/* Title & Info */}
        <div className="mb-3">
          <h3 className="font-black text-[16px] leading-[1.25] text-[#1C1C1E] line-clamp-2 mb-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1.5 text-gray-500">
               <MapPin size={12} strokeWidth={2.5}/>
               <span className="text-[11px] font-extrabold uppercase tracking-widest">{item.location}</span>
             </div>
             
             <div className="flex items-center gap-1 bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-white">
               <Star size={11} strokeWidth={3} className="fill-[#F59E0B] text-[#F59E0B]" />
               <span className="text-[11px] font-black text-[#1C1C1E]">{item.rating || 4.8}</span>
               <span className="text-[10px] font-bold text-gray-400">({item.reviews || 0})</span>
             </div>
          </div>
        </div>

        {/* Footer (Price Hook) */}
        <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between">
           <div>
             <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Base Rate</span>
             <div className="font-black text-[15px] text-[#1C1C1E] tracking-tight leading-none mt-0.5">
               {formattedPrice}
             </div>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-[#D9FB41] flex items-center justify-center text-[#1C1C1E] scale-90 group-hover:scale-100 transition-transform">
             <Bookmark size={14} fill="currentColor" />
           </div>
        </div>

      </div>
    </Link>
  );
}
