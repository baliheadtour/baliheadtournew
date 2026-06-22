"use client";

import React, { useState } from "react";
import { ChevronLeft, Share, Heart, Star, Calendar, Clock, Plane, Building, Utensils, User, Bus, ArrowRight, MoreVertical, CheckCircle2, Languages, Car, Minus, Plus, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import ListingCard from "@/components/listing/ListingCard";
import dynamic from "next/dynamic";
import { useSession, signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";

const BookingModal = dynamic(() => import("@/components/booking/BookingModal"), { ssr: false });

export default function TourDetailClient({ tourData, slug, relatedTours }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("About this activity");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [desktopPax, setDesktopPax] = useState(tourData?.minPax || 1);
  const [desktopDate, setDesktopDate] = useState("");
  const [modalStartStep, setModalStartStep] = useState(1);
  const [spaDuration, setSpaDuration] = useState('min60');
  const [scooterDuration, setScooterDuration] = useState('daily');
  const [selectedPackage, setSelectedPackage] = useState('Standard');
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reviews State
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewCode, setReviewCode] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
  const [localReviews, setLocalReviews] = useState(tourData?.reviewsList || []);

  const getMultiplierPrice = (rawPrice) => {
    const p = Number(rawPrice);
    if (!p) return 0;
    return Math.floor(p > 1000 ? p : p * 1000);
  };

  const getUnitDynamicPrice = () => {
    if (!tourData) return 0;
    if (tourData.service === "Spa") {
        return getMultiplierPrice(tourData[spaDuration] || tourData.price);
    }
    if (tourData.service === "Scooter") {
        const keyMap = { daily: 'dailyPrice', weekly: 'weeklyPrice', monthly: 'monthlyPrice' };
        return getMultiplierPrice(tourData[keyMap[scooterDuration]] || tourData.price);
    }
    
    let basePrice = getMultiplierPrice(tourData.price);
    if (tourData.pricingType === "Per Person" && tourData.tourTiers) {
       const sortedTiers = [...tourData.tourTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
       const tier = sortedTiers.find(t => desktopPax >= Number(t.pax));
       if (tier) basePrice = getMultiplierPrice(tier.price);
    }
    return basePrice;
  };

  const getAllInclusivePriceForPax = (pax) => {
      if (!tourData) return 0;
      let aiPrice = getMultiplierPrice(tourData.allInclusiveSurcharge);
      if (tourData.allInclusiveTiers && tourData.allInclusiveTiers.length > 0) {
          const sortedTiers = [...tourData.allInclusiveTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
          const aiTier = sortedTiers.find(t => pax >= Number(t.pax));
          if (aiTier) aiPrice = getMultiplierPrice(aiTier.price);
      }
      return aiPrice;
  };

  const getTotalPrice = () => {
     if (!tourData) return 0;
     let total = 0;
     if (tourData.service === "Spa" || tourData.service === "Scooter") {
        total = getUnitDynamicPrice() * desktopPax;
     } else {
        let baseUnit = getUnitDynamicPrice();
        if (selectedPackage === "All Inclusive" && (tourData.hasAllInclusive || tourData.allInclusiveSurcharge)) {
           baseUnit = getAllInclusivePriceForPax(desktopPax);
           if (tourData.allInclusiveTiers && tourData.allInclusiveTiers.length > 0) {
              total = baseUnit; // Tiers are total prices
           } else {
              total = baseUnit * desktopPax; // Fallback to multiplying surcharge
           }
        } else {
           if (tourData.pricingType === "Per Group") {
              total = baseUnit;
           } else if (tourData.tourTiers && tourData.tourTiers.length > 0) {
              total = baseUnit; // Tiers are total prices
           } else {
              total = baseUnit * desktopPax;
           }
        }
     }
     return total;
  };

  React.useEffect(() => {
    const checkSaved = async () => {
      if (session?.user?.email && tourData?.id) {
         const { data: savedItem } = await supabase
           .from('bookings')
           .select('id')
           .eq('details->>isWishlist', 'true')
           .eq('details->>customer_email', session.user.email)
           .eq('details->item->>id', tourData.id)
           .single();
         if (savedItem) setIsSaved(true);
      }
    };
    checkSaved();
  }, [tourData?.id, session]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tourData?.title || 'Discovering Bali',
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      signIn('google');
      return;
    }
    if (isSaving || !tourData) return;
    setIsSaving(true);
    
    try {
      if (isSaved) {
        // Remove from wishlist
        await supabase
          .from('bookings')
          .delete()
          .eq('details->>isWishlist', 'true')
          .eq('details->>customer_email', session.user.email)
          .eq('details->item->>id', tourData.id);
        setIsSaved(false);
      } else {
        // Add to wishlist using bookings table
        await supabase.from('bookings').insert({
          id: `FAV-${Date.now()}`,
          customer_name: session.user.name || session.user.email,
          contact_info: session.user.email,
          service_name: tourData.title,
          booking_date: new Date().toISOString().split('T')[0],
          amount: "0",
          status: 'Pending',
          category: 'Tour',
          details: { customer_email: session.user.email, item: tourData, image: tourData.images[0], isWishlist: true }
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const nameToUse = session?.user?.name || reviewName;
    if (!nameToUse.trim() || !reviewComment.trim() || !reviewCode.trim()) {
      setReviewMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tourData.id,
          name: nameToUse,
          userImage: session?.user?.image || null,
          rating: reviewRating,
          comment: reviewComment,
          accessCode: reviewCode
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setReviewMessage({ type: 'error', text: data.error || 'Failed to submit review.' });
      } else {
        setReviewMessage({ type: 'success', text: 'Review submitted successfully!' });
        setLocalReviews([...localReviews, data.newReview]);
        setReviewName("");
        setReviewComment("");
        setReviewCode("");
        setReviewRating(5);
      }
    } catch (err) {
      setReviewMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const tabs = ["About this activity", "Experience", "Itinerary", "Important information", "Reviews"];

  if (!tourData) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-background">
         <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
         <p className="font-bold text-gray-500">Loading Details...</p>
       </div>
     );
  }

  return (
    <div className="-mt-20 md:-mt-24 w-full bg-background min-h-[100dvh] relative pb-[120px] md:pb-0">
      
      {/* Mobile View: Edge-to-Edge Image Gallery with Floating Controls */}
      <div className="relative w-full overflow-hidden h-[55vh] md:hidden z-20 bg-background">
        <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
          {tourData.images.map((img, idx) => (
             <div key={idx} className="min-w-full h-full snap-center relative">
               <Image src={img} alt={`${tourData.title || "Tour"} Image ${idx + 1}`} fill sizes="100vw" className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
             </div>
          ))}
        </div>
        
        <div className="absolute top-0 left-0 right-0 w-full p-6 pt-[calc(env(safe-area-inset-top)+20px)] flex justify-between items-center z-30 pointer-events-none">
          <button onClick={() => router.back()} className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <ChevronLeft size={24} className="text-primary pr-0.5" strokeWidth={2.5} />
          </button>
          <div className="flex gap-3 pointer-events-auto">
            <button onClick={handleShare} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
              <Share size={20} className="text-primary" strokeWidth={2.5} />
            </button>
            <button onClick={handleSave} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
              <Heart size={20} className={isSaved ? "text-red-500 fill-red-500" : "text-primary"} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View: Apple-Style Rounded Card Gallery */}
      <div className="hidden md:flex flex-col w-full max-w-[1240px] mx-auto px-6 pt-[90px] mb-4">
        
        {/* Clean Header Row for Back/Share/Save */}
        <div className="flex justify-between items-center mb-5 pb-1">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[15px] font-bold text-primary hover:text-accent transition-colors group">
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="flex items-center gap-2 text-[14px] font-bold text-primary hover:text-text-secondary transition-colors">
              <Share size={18} strokeWidth={2.5} /> Share
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 text-[14px] font-bold text-primary hover:text-text-secondary transition-colors">
              <Heart size={18} strokeWidth={2.5} className={isSaved ? "text-red-500 fill-red-500" : ""} /> {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="h-[55vh] min-h-[450px] max-h-[550px] w-full rounded-[32px] overflow-hidden relative">
          <div 
             className="grid grid-rows-2 gap-2 h-full w-full overflow-x-auto no-scrollbar"
             style={{ 
               gridAutoFlow: 'column', 
               gridAutoColumns: tourData.images.length > 5 ? 'calc(23% - 6px)' : 'calc(25% - 6px)' 
             }}
          >
            <div className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer">
              <Image src={tourData.images[0]} alt="Hero Main" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            </div>
            {tourData.images.slice(1).map((img, idx) => (
              <div key={idx} className="relative group overflow-hidden cursor-pointer">
                 <Image src={img} alt={`Gallery ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100" />
                 <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Get Your Guide Dual Column Layout */}
      <div className={`relative z-30 rounded-t-[32px] md:rounded-none -mt-6 md:mt-0 pt-8 md:pt-6 pb-12 w-full mx-auto ${tourData.service === "Spa" ? "bg-[#fdfbf7]" : "bg-white"}`}>
        <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Details */}
          <div className="w-full md:w-[65%] lg:w-[68%]">
            
            {/* Title Section */}
            <div className="mb-8 flex flex-col">
              <h1 className={`leading-[1.2] mb-3 text-balance ${tourData.service === "Spa" ? "text-[32px] md:text-[42px] font-serif tracking-tight text-[#3d3730]" : "text-[28px] md:text-[36px] font-extrabold text-primary"}`}>{selectedPackage === "All Inclusive" && tourData.inclusiveTitle ? tourData.inclusiveTitle : tourData.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <Star size={16} className={tourData.service === "Spa" ? "fill-[#C1A88A] text-[#C1A88A]" : "fill-accent text-accent"} />
                  <span className={`font-bold text-[15px] ${tourData.service === "Spa" ? "text-[#3d3730]" : "text-primary"}`}>{Number(tourData.rating).toFixed(1)}</span>
                  <span 
                    onClick={() => {
                      setActiveTab("Reviews");
                      document.getElementById("tour-details-tabs")?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-text-secondary text-[13px] underline cursor-pointer hover:text-text-primary"
                  >
                    ({tourData.reviews || 0} reviews)
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className={`font-medium text-[14px] hover:underline cursor-pointer ${tourData.service === "Spa" ? "text-[#C1A88A]" : "text-text-secondary"}`}>{tourData.location}</span>
              </div>
            </div>
            
            {/* Scrollable Tabs */}
            <div id="tour-details-tabs" className="flex overflow-x-auto no-scrollbar gap-2 mb-8 -mx-6 px-6 md:mx-0 md:px-0 scroll-mt-24">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2.5 px-5 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${
                      isActive 
                        ? (tourData.service === "Spa" ? "bg-[#A48F7A] text-white shadow-sm" : "bg-accent text-primary shadow-sm")
                        : (tourData.service === "Spa" ? "bg-[#f0ede6] hover:bg-[#e6e2d8] text-[#8F8F99]" : "bg-surface hover:bg-surface-hover text-text-secondary")
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {/* Content Section (About this activity Active) */}
            {activeTab === "About this activity" && (
              <div className="animate-in fade-in duration-300">
                <h3 className={`font-bold text-[22px] md:text-[24px] mb-6 ${tourData.service === "Spa" ? "text-[#3d3730] font-serif" : "text-primary"}`}>About this activity</h3>
                
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 size={24} className={`${tourData.service === "Spa" ? "text-[#A48F7A]" : "text-green-500"} shrink-0 mt-0.5`} strokeWidth={2} />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[16px] ${tourData.service === "Spa" ? "text-[#3d3730]" : "text-primary"}`}>Free cancellation</span>
                      <span className="text-sm font-medium text-text-secondary mt-1">Cancel up to 24 hours in advance for a full refund</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Calendar size={24} className={`${tourData.service === "Spa" ? "text-[#A48F7A]" : "text-primary"} shrink-0 mt-0.5`} strokeWidth={2} />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[16px] ${tourData.service === "Spa" ? "text-[#3d3730]" : "text-primary"}`}>Reserve now & pay later</span>
                      <span className="text-sm font-medium text-text-secondary mt-1">Keep your travel plans flexible — book your spot and pay nothing today.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock size={24} className={`${tourData.service === "Spa" ? "text-[#A48F7A]" : "text-primary"} shrink-0 mt-0.5`} strokeWidth={2} />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[16px] ${tourData.service === "Spa" ? "text-[#3d3730]" : "text-primary"}`}>{tourData.service === "Spa" ? "Treatment Duration" : "Duration " + tourData.duration}</span>
                      <span className="text-sm font-medium text-text-secondary mt-1">{tourData.service === "Spa" ? "Customizable treatment lengths" : "Check availability to see starting times."}</span>
                    </div>
                  </div>

                  {tourData.service === "Tour" && (
                    <>
                      <div className="flex items-start gap-4">
                        <Languages size={24} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
                        <div className="flex flex-col">
                          <span className="font-bold text-[16px] text-primary">Live tour guide</span>
                          <span className="text-sm font-medium text-text-secondary mt-1">English, Indonesian</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Car size={24} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
                        <div className="flex flex-col">
                          <span className="font-bold text-[16px] text-primary">Pickup included</span>
                          <span className="text-sm font-medium text-text-secondary mt-1">Wait in the hotel lobby 10 minutes before your scheduled pickup time.</span>
                        </div>
                      </div>
                    </>
                  )}

                  {tourData.service === "Scooter" && (
                     <div className="flex items-start gap-4">
                        <CheckCircle2 size={24} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
                        <div className="flex flex-col">
                           <span className="font-bold text-[16px] text-primary">Rental Inclusions</span>
                           <span className="text-sm font-medium text-text-secondary mt-1">Includes 2 helmets, raincoat, and reliable customer support.</span>
                        </div>
                     </div>
                  )}

                  {tourData.service === "Spa" && (
                     <div className="flex items-start gap-4">
                        <CheckCircle2 size={24} className="text-[#A48F7A] shrink-0 mt-0.5" strokeWidth={2} />
                        <div className="flex flex-col">
                           <span className="font-bold text-[16px] text-[#3d3730]">Luxury Experience</span>
                           <span className="text-sm font-medium text-text-secondary mt-1">Professional therapists using premium essential oils.</span>
                        </div>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Section (Experience Active) */}
            {activeTab === "Experience" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-bold text-[22px] md:text-[24px] text-primary mb-6">Experience</h3>
                <h4 className="font-bold text-[16px] text-primary mb-3">Highlights</h4>
                <ul className="list-disc pl-5 text-sm text-text-secondary font-medium mb-8 space-y-2">
                   {tourData.highlights ? tourData.highlights.split('\n').map((h, i) => <li key={i}>{h}</li>) : <li>No highlights defined yet.</li>}
                </ul>
                <h4 className="font-bold text-[16px] text-primary mb-3">Full description</h4>
                <p className="text-sm text-text-secondary leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {tourData.description || "The administrator has not provided a description for this tour yet."}
                </p>
              </div>
            )}

            {/* Content Section (Itinerary Active) */}
            {activeTab === "Itinerary" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-bold text-[22px] md:text-[24px] text-primary mb-6">Itinerary</h3>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 mb-8">
                  {tourData.itinerary && tourData.itinerary.length > 0 ? tourData.itinerary.map((itin, index) => (
                    <div key={index} className="relative pl-6">
                       <div className="absolute w-[11px] h-[11px] bg-white border-2 border-primary rounded-full -left-[6.5px] top-1.5"></div>
                       <h4 className="font-bold text-[16px] text-primary">{itin.title || `Stop ${index + 1}`}</h4>
                       <p className="text-sm font-medium text-text-secondary mt-1.5">{itin.description}</p>
                    </div>
                  )) : (
                    <div className="relative pl-6">
                       <div className="absolute w-[11px] h-[11px] bg-white border-2 border-primary rounded-full -left-[6.5px] top-1.5"></div>
                       <h4 className="font-bold text-[16px] text-primary">Flexible Itinerary</h4>
                       <p className="text-sm font-medium text-text-secondary mt-1.5">The exact itinerary is flexible and determined on the day of the tour.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Content Section (Important information Active) */}
            {activeTab === "Important information" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-bold text-[22px] md:text-[24px] text-primary mb-6">Important information</h3>
                
                <div className="mb-8">
                   <h4 className="font-bold text-[16px] text-primary mb-3">What's Included</h4>
                   <ul className="list-disc pl-5 text-sm text-text-secondary font-medium space-y-2">
                      {selectedPackage === "All Inclusive" && tourData.inclusiveIncluded 
                         ? tourData.inclusiveIncluded.split('\n').map((inc, i) => <li key={i}>{inc}</li>) 
                         : tourData.included ? tourData.included.split('\n').map((inc, i) => <li key={i}>{inc}</li>) : <li>Standard amenities.</li>}
                   </ul>
                </div>

                {(selectedPackage === "All Inclusive" && tourData.inclusiveExcluded) ? (
                  <div className="mb-8">
                     <h4 className="font-bold text-[16px] text-primary mb-3">What's Excluded</h4>
                     <ul className="list-disc pl-5 text-sm text-text-secondary font-medium space-y-2">
                        {tourData.inclusiveExcluded.split('\n').map((exc, i) => <li key={i}>{exc}</li>)}
                     </ul>
                  </div>
                ) : tourData.excluded ? (
                  <div className="mb-8">
                     <h4 className="font-bold text-[16px] text-primary mb-3">What's Excluded</h4>
                     <ul className="list-disc pl-5 text-sm text-text-secondary font-medium space-y-2">
                        {tourData.excluded.split('\n').map((exc, i) => <li key={i}>{exc}</li>)}
                     </ul>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-bold text-[22px] md:text-[24px] text-primary mb-6">Customer Reviews</h3>
                
                {/* Review Form */}
                <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-gray-100 mb-8 shadow-sm">
                   <h4 className="font-bold text-[18px] text-primary mb-4">Leave a Review</h4>
                   
                   {reviewMessage.text && (
                     <div className={`p-3 rounded-xl mb-4 text-sm font-bold ${reviewMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                       {reviewMessage.text}
                     </div>
                   )}

                   {!session ? (
                     <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center">
                        <p className="text-sm font-bold text-gray-500 mb-5">You must be logged in to write a review.</p>
                        <button 
                          onClick={() => signIn("google")}
                          className="px-6 py-2.5 bg-white text-primary font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-3"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                          Sign in with Google
                        </button>
                     </div>
                   ) : (
                     <form onSubmit={handleSubmitReview} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Posting As</label>
                           <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-primary flex items-center gap-2">
                             {session.user?.image ? (
                               <img src={session.user.image} alt={session.user.name} className="w-5 h-5 rounded-full" />
                             ) : (
                               <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">{session.user?.name?.charAt(0)}</div>
                             )}
                             {session.user?.name}
                           </div>
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Access Code</label>
                           <input 
                             type="text" 
                             required 
                             placeholder="Enter access code"
                           className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                           value={reviewCode}
                           onChange={(e) => setReviewCode(e.target.value)}
                         />
                       </div>
                     </div>
                     
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Rating</label>
                       <div className="flex gap-1">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button 
                             key={star} 
                             type="button" 
                             onClick={() => setReviewRating(star)}
                             className="focus:outline-none"
                           >
                             <Star size={24} className={star <= reviewRating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"} />
                           </button>
                         ))}
                       </div>
                     </div>

                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Comment</label>
                       <textarea 
                         required 
                         rows={4}
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none"
                         value={reviewComment}
                         onChange={(e) => setReviewComment(e.target.value)}
                       ></textarea>
                     </div>

                     <button 
                       type="submit" 
                       disabled={isSubmittingReview}
                       className="px-6 py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                     >
                       {isSubmittingReview ? "Submitting..." : "Submit Review"}
                     </button>
                   </form>
                   )}
                </div>

                {/* Display Live Reviews */}
                <div className="space-y-4">
                   <h4 className="font-bold text-[18px] text-primary mb-4">All Reviews ({localReviews.length})</h4>
                   {localReviews.length === 0 ? (
                     <p className="text-gray-500 text-sm font-medium italic">No reviews yet. Be the first to leave one!</p>
                   ) : (
                     <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                       {[...localReviews].reverse().map(review => (
                         <div key={review.id} className="min-w-[280px] max-w-[320px] snap-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col shrink-0">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 {review.userImage ? (
                                   <img src={review.userImage} alt={review.user} className="w-8 h-8 rounded-full shadow-sm object-cover" />
                                 ) : (
                                   <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                      {review.user?.charAt(0) || 'U'}
                                   </div>
                                 )}
                                 <span className="font-bold text-primary text-sm">{review.user}</span>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-0.5 mb-3">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={12} className={i < review.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"} />
                             ))}
                           </div>
                           <div className="relative">
                             <p className={`text-sm font-medium text-gray-600 leading-relaxed ${expandedReviews[review.id] ? '' : 'line-clamp-4'}`}>{review.comment}</p>
                             {review.comment && review.comment.length > 150 && (
                               <button 
                                 onClick={() => setExpandedReviews(prev => ({...prev, [review.id]: !prev[review.id]}))}
                                 className="text-primary text-xs font-bold mt-1 hover:underline"
                               >
                                 {expandedReviews[review.id] ? 'Read less' : 'Read more'}
                               </button>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Widget (Desktop) */}
          <div className="hidden md:block md:w-[35%] lg:w-[32%]">
            <div className={`sticky top-[120px] rounded-2xl p-6 shadow-lg z-10 w-full ${tourData.service === "Spa" ? "bg-white border border-[#f0ede6]" : "bg-white border border-gray-200"}`}>
               <div className="mb-4 flex items-end gap-1">
                  <span className={`text-[34px] font-extrabold leading-none ${tourData.service === "Spa" ? "text-[#3d3730] font-serif tracking-tight" : "text-primary"}`}>IDR {getUnitDynamicPrice().toLocaleString('id-ID')}</span>
                  <span className="text-text-secondary text-[15px] font-medium pb-1">/ {tourData.service === "Spa" ? "treatment" : tourData.service === "Scooter" ? scooterDuration.replace('daily', 'day').replace('weekly', 'week').replace('monthly', 'month') : tourData.pricingType === "Per Group" ? "group" : (tourData.tourTiers && tourData.tourTiers.length > 0 ? "total" : "person")}</span>
               </div>
               
               <p className="text-sm text-text-secondary font-medium mb-6">Reserve now and pay later to book your spot and pay nothing today.</p>

               {tourData.service === "Spa" && (
                 <div className="mb-4">
                   <span className="font-bold text-text-secondary text-[14px] mb-2 block ml-1">Treatment Duration</span>
                   <div className="flex bg-[#F4F4F6] p-1 rounded-2xl w-full">
                     {[
                       { id: 'min60', label: '60 Min', price: tourData.min60 },
                       { id: 'min90', label: '90 Min', price: tourData.min90 },
                       { id: 'min120', label: '120 Min', price: tourData.min120 }
                     ].filter(opt => opt.price).map(opt => (
                       <button
                         key={opt.id}
                         onClick={() => setSpaDuration(opt.id)}
                         className={`flex-1 py-1.5 text-[13px] font-bold rounded-xl transition-all ${spaDuration === opt.id ? 'bg-[#A48F7A] text-white shadow-sm' : 'text-text-secondary hover:text-[#A48F7A]'}`}
                       >
                         {opt.label}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {tourData.service === "Scooter" && (
                 <div className="mb-4">
                   <span className="font-bold text-text-secondary text-[14px] mb-2 block ml-1">Rental Duration</span>
                   <div className="flex bg-[#F4F4F6] p-1 rounded-2xl w-full">
                     {[
                       { id: 'daily', label: 'Daily', price: tourData.dailyPrice },
                       { id: 'weekly', label: 'Weekly', price: tourData.weeklyPrice },
                       { id: 'monthly', label: 'Monthly', price: tourData.monthlyPrice }
                     ].filter(opt => opt.price).map(opt => (
                       <button
                         key={opt.id}
                         onClick={() => setScooterDuration(opt.id)}
                         className={`flex-1 py-1.5 text-[13px] font-bold rounded-xl transition-all ${scooterDuration === opt.id ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                       >
                         {opt.label}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Package Selector */}
               {(tourData.service === "Tour" || tourData.service === "Activities") && tourData.allInclusiveSurcharge && (
                 <div className="mb-5">
                   <span className="font-bold text-text-secondary text-[14px] mb-2 block ml-1">Select your package</span>
                   <div className="flex flex-col gap-2">
                      <div 
                         onClick={() => setSelectedPackage('Standard')}
                         className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === 'Standard' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary text-[14px]">Standard Package</span>
                            {selectedPackage === 'Standard' && <CheckCircle2 size={16} className="text-primary" />}
                         </div>
                         <p className="text-[12px] text-text-secondary font-medium">Driver and guide only. Entrance fees not included.</p>
                      </div>
                      <div 
                         onClick={() => setSelectedPackage('All Inclusive')}
                         className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === 'All Inclusive' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary text-[14px]">All-Inclusive</span>
                            <span className="text-[12px] font-bold text-accent">Rp {getAllInclusivePriceForPax(desktopPax).toLocaleString('id-ID')}/pax</span>
                         </div>
                         <p className="text-[12px] text-text-secondary font-medium">All entrance fees covered. Hassle-free experience.</p>
                      </div>
                   </div>
                 </div>
               )}

               {/* Date Selector Desktop */}
               <div className="mb-4 bg-[#F4F4F6] p-3 rounded-2xl flex items-center justify-between relative overflow-hidden">
                 <span className="font-bold text-text-secondary text-[14px] ml-1">Select Date</span>
                 <div className="relative">
                   <input 
                     type="date" 
                     value={desktopDate}
                     onChange={(e) => setDesktopDate(e.target.value)}
                     className="bg-transparent font-extrabold text-[15px] text-primary outline-none cursor-pointer appearance-none text-right pr-1 relative z-10 w-[135px]"
                     style={{ colorScheme: 'light' }}
                   />
                 </div>
               </div>

               {/* Add Pax Calculator Desktop */}
               <div className="flex items-center justify-between mb-6 bg-[#F4F4F6] p-3 rounded-2xl">
                 <span className="font-bold text-text-secondary text-[14px] ml-1">{tourData.service === "Scooter" ? "Quantity" : "Number of persons"}</span>
                 <div className="flex items-center gap-3">
                   <button onClick={() => setDesktopPax(Math.max(tourData.minPax || 1, desktopPax - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"><Minus size={16} strokeWidth={3} /></button>
                   <span className="font-extrabold text-primary text-[15px] w-4 text-center">{desktopPax}</span>
                   <button onClick={() => setDesktopPax(desktopPax + 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"><Plus size={16} strokeWidth={3} /></button>
                 </div>
               </div>

               {tourData?.title?.toLowerCase().includes('vw') && desktopPax > 3 && (
                 <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mb-6 shadow-sm">
                   <div className="bg-amber-100 p-1.5 rounded-full shrink-0"><Info className="text-amber-600" size={16} strokeWidth={2.5} /></div>
                   <p className="text-[12px] font-bold text-amber-800 leading-snug pt-0.5">A classic VW Safari fits max 3 passengers. Your group will get multiple cars to travel in a fun convoy!</p>
                 </div>
               )}

               <div className="flex items-center justify-between mb-6 px-1">
                 <span className="font-bold text-primary text-[16px]">Total</span>
                 <span className="font-extrabold text-primary text-[24px]">IDR {getTotalPrice().toLocaleString('id-ID')}</span>
               </div>

               <button 
                 onClick={() => {
                   setModalStartStep(2);
                   setIsBookingModalOpen(true);
                 }} 
                 className={`w-full py-4 rounded-[20px] flex items-center justify-center gap-2 font-bold transition-all active:-translate-y-1 text-[17px] mb-6 shadow-sm ${tourData.service === "Spa" ? 'bg-[#A48F7A] hover:bg-[#8e7a67] text-white' : 'bg-accent hover:bg-accent-hover text-primary'}`}
               >
                 Check availability
               </button>

               <div className="flex flex-col gap-4 border-t border-border pt-6">
                 <div className="flex gap-3 text-[15px] text-text-secondary font-medium">
                   <Calendar size={20} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
                   <div className="flex flex-col">
                     <span className="font-bold text-primary">Free Cancellation</span>
                     <span className="text-[13px] mt-0.5">Cancel up to 24h before completely free.</span>
                   </div>
                 </div>
                 <div className="flex gap-3 text-[15px] text-text-secondary font-medium">
                   <Clock size={20} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
                   <div className="flex flex-col">
                     <span className="font-bold text-primary">Duration</span>
                     <span className="text-[13px] mt-0.5">{tourData.duration}</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Related Tours Section */}
      {relatedTours && relatedTours.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 md:py-16 border-t border-gray-100">
          <h2 className="text-2xl font-black text-primary mb-6">You Might Also Like</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 snap-x snap-mandatory">
            {relatedTours.map((item) => (
              <div key={item.id} className="w-[260px] md:w-auto shrink-0 snap-start">
                 <ListingCard item={item} linkTo={`/tours/${generateSlug(item.title)}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom Booking Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white z-40 px-5 pt-3.5 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-border">
        <div className="flex flex-col gap-2">
           {/* Package Selector for Mobile (Hidden per user request, moved to Modal) */}
           <div className="hidden">
           {(tourData.service === "Tour" || tourData.service === "Activities") && (tourData.hasAllInclusive || tourData.allInclusiveSurcharge) && (
             <div className="flex gap-2 w-full mb-1">
                <button 
                   onClick={() => setSelectedPackage('Standard')} 
                   className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border flex-1 whitespace-nowrap transition-all ${selectedPackage === 'Standard' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-200'}`}
                >
                   Standard
                </button>
                <button 
                   onClick={() => setSelectedPackage('All Inclusive')} 
                   className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border flex-1 whitespace-nowrap transition-all flex justify-center items-center gap-1 ${selectedPackage === 'All Inclusive' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-200'}`}
                >
                   All-Inclusive <span className={selectedPackage === 'All Inclusive' ? 'text-white/80' : 'text-accent'}>Rp {getAllInclusivePriceForPax(desktopPax).toLocaleString('id-ID')}</span>
                </button>
             </div>
           )}
           </div>
           <div className="flex items-center justify-between gap-3">
             <div className="flex flex-col flex-1 overflow-hidden">
               {tourData.service !== "Tour" && (
                 <div className="flex gap-2 w-full mb-2">
                   {tourData.service === "Spa" ? (
                      [
                        { id: 'min60', label: '60 Min', price: tourData.min60 },
                        { id: 'min90', label: '90 Min', price: tourData.min90 },
                        { id: 'min120', label: '120 Min', price: tourData.min120 }
                      ].filter(opt => opt.price).map(opt => (
                        <button key={opt.id} onClick={() => setSpaDuration(opt.id)} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex-1 whitespace-nowrap ${spaDuration === opt.id ? 'bg-[#A48F7A] text-white border-[#A48F7A]' : 'bg-white text-[#A48F7A] border-gray-200'}`}>
                          {opt.label}
                        </button>
                      ))
                   ) : tourData.service === "Scooter" ? (
                      [
                        { id: 'daily', label: 'Daily', price: tourData.dailyPrice },
                        { id: 'weekly', label: 'Weekly', price: tourData.weeklyPrice },
                        { id: 'monthly', label: 'Monthly', price: tourData.monthlyPrice }
                      ].filter(opt => opt.price).map(opt => (
                        <button key={opt.id} onClick={() => setScooterDuration(opt.id)} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex-1 whitespace-nowrap ${scooterDuration === opt.id ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-200'}`}>
                          {opt.label}
                        </button>
                      ))
                   ) : null}
                 </div>
               )}
               <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">
                  {(tourData.service === "Tour" || tourData.service === "Activities") && tourData.allInclusiveSurcharge ? "Select your package" : "Price starting from"}
               </span>
               <div className="flex items-baseline gap-1.5 truncate">
               <span className={`text-[20px] font-black leading-none tracking-tight truncate ${tourData.service === "Spa" ? "text-[#3d3730] font-serif" : "text-primary"}`}>
                  {selectedPackage === 'All Inclusive' && (tourData.hasAllInclusive || tourData.allInclusiveSurcharge) ? getAllInclusivePriceForPax(desktopPax).toLocaleString('id-ID') : getUnitDynamicPrice().toLocaleString('id-ID')}
               </span>
            </div>
          </div>
          <button 
            onClick={() => {
              setModalStartStep(1);
              setIsBookingModalOpen(true);
            }} 
            className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 shrink-0 whitespace-nowrap ${tourData.service === "Spa" ? 'bg-[#A48F7A] hover:bg-[#8e7a67] text-white' : 'bg-accent hover:bg-accent-hover text-primary'}`}
          >
            {(tourData.hasAllInclusive || tourData.allInclusiveSurcharge) ? 'Select Options' : 'Book Now'} <ArrowRight size={16} strokeWidth={3} className="-mr-1" />
          </button>
        </div>
      </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)}
        serviceData={{ 
            type: tourData.service?.toLowerCase() || 'tour', 
            id: tourData.id, 
            title: tourData.title, // Base title, modal handles inclusive title
            baseTitle: tourData.title,
            inclusiveTitle: tourData.inclusiveTitle,
            price: tourData.price, 
            pricingType: tourData.pricingType, // Original pricing type, modal overrides for inclusive
            tourTiers: tourData.tourTiers,
            selectedPackage: (tourData.hasAllInclusive || tourData.allInclusiveSurcharge) ? selectedPackage : null,
            allInclusiveSurcharge: tourData.allInclusiveSurcharge,
            hasAllInclusive: tourData.hasAllInclusive,
            allInclusiveTiers: tourData.allInclusiveTiers,
            minPax: tourData.minPax || 1,
            image: tourData.images[0]
         }} 
        initialPax={desktopPax}
        initialDate={desktopDate}
        startStep={modalStartStep}
        onPackageChange={setSelectedPackage}
        onPaxChange={setDesktopPax}
        onDateChange={setDesktopDate}
      />

    </div>
  );
}

