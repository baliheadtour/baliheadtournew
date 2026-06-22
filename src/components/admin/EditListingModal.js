"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  X, Save, Image as ImageIcon, MapPin, DollarSign, Clock, Tag, Plus, Target, Star, Trash2,
  Compass, Map, Camera, Footprints, Droplet, Sparkles, Heart, Activity,
  Bike, Zap, Shield, Car, Navigation, Users, SunMedium, CheckCircle2, Calendar, ChevronDown
} from "lucide-react";

export default function EditListingModal({ item, activeTab, onClose, onSave }) {
  // Core Info
  const [formData, setFormData] = useState({
    title: item.title || "",
    location: item.location || "",
    duration: item.duration || "",
    category: item.category || "",
    status: item.status || "Active",
    image: item.image || "",
    company: item.company || "",
    spaSetting: item.spaSetting || "Real Spa",
    serviceType: item.service || activeTab
  });

  const [pins, setPins] = useState({
    isCampaignPinned: item.isCampaignPinned || false,
    campaignTitle: item.campaignTitle || "",
    campaignDescription: item.campaignDescription || "",
    campaignLabel: item.campaignLabel || "",
    isBestTripPinned: item.isBestTripPinned || false
  });

  const [itinerary, setItinerary] = useState(item.itinerary || [{ title: '', description: '' }]);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Rich Text Fields
  const [details, setDetails] = useState({
    description: item.description || "",
    highlights: item.highlights || "",
    included: item.included || "",
    excluded: item.excluded || ""
  });

  const [gallery, setGallery] = useState(item.gallery || ["", "", "", "", "", "", "", ""]);

  const categoryOptions = {
    Tour: [
      { name: "Island Tour", icon: Compass },
      { name: "Trekking", icon: Footprints },
      { name: "Show & Culture", icon: Map },
      { name: "Nature", icon: SunMedium },
      { name: "Sightseeing", icon: Camera },
      { name: "Adventure", icon: Target }
    ],
    Activities: [
      { name: "Water Sports", icon: Droplet },
      { name: "Wellness", icon: Heart },
      { name: "Cultural", icon: Map },
      { name: "Extreme", icon: Zap }
    ],
    Transport: [
      { name: "Transfer", icon: Navigation },
      { name: "Private Booking", icon: Car },
      { name: "Hourly Rental", icon: Clock },
      { name: "Group Van", icon: Users }
    ]
  };

  /* -- Pricing Logic States -- */
  // Tour Pricing
  const [tourPricingType, setTourPricingType] = useState(item.pricingType || "Per Person"); // 'Per Person' or 'Per Group'
  const [groupPrice, setGroupPrice] = useState(item.price || "");
  const [tourTiers, setTourTiers] = useState(item.tourTiers || [{ pax: 1, price: item.price || "" }]);
  const [hasAllInclusive, setHasAllInclusive] = useState(!!item.allInclusiveSurcharge || (item.allInclusiveTiers && item.allInclusiveTiers.length > 0));
  const [allInclusiveTiers, setAllInclusiveTiers] = useState(item.allInclusiveTiers || [{ pax: 1, price: item.allInclusiveSurcharge || "" }]);
  const [inclusiveTitle, setInclusiveTitle] = useState(item.inclusiveTitle || "");
  const [inclusiveIncluded, setInclusiveIncluded] = useState(item.inclusiveIncluded || "");
  const [inclusiveExcluded, setInclusiveExcluded] = useState(item.inclusiveExcluded || "");

  // Scooter Pricing
  const [scooterPrices, setScooterPrices] = useState({
    daily: item.dailyPrice || item.price || "",
    weekly: item.weeklyPrice || "",
    monthly: item.monthlyPrice || ""
  });

  // Spa Pricing
  const [spaPrices, setSpaPrices] = useState({
    min60: item.min60 || "",
    min90: item.min90 || "",
    min120: item.min120 || ""
  });

  // Transport Pricing
  const [transportPricePerKm, setTransportPricePerKm] = useState(item.pricePerKm || "");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDetailChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `cover_images/${fileName}`;

      const { error } = await supabase.storage
        .from('discovering_bali_images')
        .upload(filePath, file);

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('discovering_bali_images').getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
    } catch (err) {
      alert("Error uploading cover image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const newUrls = await Promise.all(files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error } = await supabase.storage.from('discovering_bali_images').upload(filePath, file);
        if (error) throw error;
        
        return supabase.storage.from('discovering_bali_images').getPublicUrl(filePath).data.publicUrl;
      }));

      const updatedGallery = [...gallery];
      let newUrlsQueue = [...newUrls];
      
      for(let i = 0; i < updatedGallery.length; i++) {
        if(updatedGallery[i] === "" && newUrlsQueue.length > 0) {
           updatedGallery[i] = newUrlsQueue.shift();
        }
      }
      while(newUrlsQueue.length > 0 && updatedGallery.length < 8) {
         updatedGallery.push(newUrlsQueue.shift());
      }
      setGallery(updatedGallery);
    } catch (err) {
       alert("Error uploading gallery: " + err.message);
    } finally {
       setIsUploading(false);
    }
  };

  const handleSave = () => {
    const finalItem = {
      ...item,
      ...formData,
      service: formData.serviceType || activeTab,
      ...details,
      ...pins,
      itinerary: itinerary,
      gallery: gallery.filter(link => link.trim() !== "")
    };
    if (activeTab === "Scooter") {
       finalItem.dailyPrice = scooterPrices.daily;
       finalItem.weeklyPrice = scooterPrices.weekly;
       finalItem.monthlyPrice = scooterPrices.monthly;
       finalItem.price = scooterPrices.daily; // Fallback for list UI
    } else if (activeTab === "Spa") {
       finalItem.min60 = spaPrices.min60;
       finalItem.min90 = spaPrices.min90;
       finalItem.min120 = spaPrices.min120;
       finalItem.price = spaPrices.min60 || spaPrices.min90; // Fallback
    } else if (activeTab === "Transport") {
       finalItem.pricePerKm = transportPricePerKm;
       finalItem.price = transportPricePerKm; // fallback
    } else {
       finalItem.pricingType = tourPricingType;
       if (tourPricingType === "Per Group") finalItem.price = groupPrice;
       else {
          finalItem.tourTiers = tourTiers;
          const validTier = tourTiers.find(t => t.price && t.price.toString().trim() !== "");
          finalItem.price = validTier ? validTier.price : ""; // Fallback to first valid tier
       }
       finalItem.hasAllInclusive = hasAllInclusive;
       if (hasAllInclusive) {
          finalItem.allInclusiveTiers = allInclusiveTiers;
          finalItem.allInclusiveSurcharge = allInclusiveTiers[0]?.price || ""; // Fallback
       } else {
          finalItem.allInclusiveTiers = null;
          finalItem.allInclusiveSurcharge = "";
       }
       finalItem.inclusiveTitle = inclusiveTitle;
       finalItem.inclusiveIncluded = inclusiveIncluded;
       finalItem.inclusiveExcluded = inclusiveExcluded;
    }
    onSave(finalItem);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center font-sans">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-gray-50 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col h-[95vh] sm:h-[85vh] overflow-hidden transform transition-transform animate-slideUp sm:animate-scaleIn z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
           <div>
             <h2 className="text-xl font-extrabold text-primary tracking-tight">Edit {activeTab} Listing</h2>
             <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide">ID: #{item.id}</p>
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} strokeWidth={3} />
              </button>
           </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="space-y-6 max-w-2xl mx-auto">
            
             {/* PINNING CONTROLS */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
               <div className="flex-1 flex flex-col justify-center">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 text-sm font-extrabold text-primary"><Target size={16} className="text-[#cce823]"/> Pin to Campaign</div>
                     <p className="text-[11px] font-semibold text-gray-500">Feature this in massive homepage hero slider</p>
                   </div>
                   {/* Apple Toggle */}
                   <div 
                     onClick={() => setPins({...pins, isCampaignPinned: !pins.isCampaignPinned})}
                     className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${pins.isCampaignPinned ? 'bg-[#cce823]' : 'bg-gray-200'}`}>
                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${pins.isCampaignPinned ? 'translate-x-6' : ''}`} />
                   </div>
                 </div>
                 {pins.isCampaignPinned && (
                   <div className="mt-3 space-y-2">
                     <input 
                       type="text" 
                       placeholder="Campaign Title (e.g. Best Deals this Summer!)" 
                       value={pins.campaignTitle} 
                       onChange={(e) => setPins({...pins, campaignTitle: e.target.value})} 
                       className="w-full bg-gray-50 text-xs font-bold text-primary rounded-xl px-3 py-2 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                     />
                     <textarea
                       placeholder="Campaign Description..."
                       value={pins.campaignDescription}
                       onChange={(e) => setPins({...pins, campaignDescription: e.target.value})}
                       className="w-full bg-gray-50 text-xs font-medium text-primary rounded-xl px-3 py-2 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors h-16"
                     ></textarea>
                     <select
                       value={pins.campaignLabel}
                       onChange={(e) => setPins({...pins, campaignLabel: e.target.value})}
                       className="w-full bg-gray-50 text-xs font-bold text-primary rounded-xl px-3 py-2 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors appearance-none"
                     >
                        <option value="">No Label</option>
                        <option value="Exclusive">Exclusive</option>
                        <option value="Best Deal">Best Deal</option>
                        <option value="Limited Time">Limited Time</option>
                        <option value="20% OFF">20% OFF</option>
                        <option value="Most Popular">Most Popular</option>
                     </select>
                   </div>
                 )}
               </div>
               
               <div className="hidden sm:block w-px bg-gray-100"></div>

               <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-primary"><Star size={16} className="text-yellow-500"/> Best Trips Label</div>
                    <p className="text-[11px] font-semibold text-gray-500">Show inside the Best Recommended section</p>
                  </div>
                  {/* Apple Toggle */}
                  <div 
                    onClick={() => setPins({...pins, isBestTripPinned: !pins.isBestTripPinned})}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${pins.isBestTripPinned ? 'bg-yellow-500' : 'bg-gray-200'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${pins.isBestTripPinned ? 'translate-x-6' : ''}`} />
                  </div>
               </div>
            </div>

            {/* Core Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 sm:flex-row flex-col">
                  <div className="flex-[2]">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                      {activeTab === "Transport" ? "Car Model" : "Service Title"}
                    </label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                  </div>
                  {(activeTab === "Tour" || activeTab === "Activities") && (
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Service Type</label>
                       <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none">
                          <option value="Tour">Tour</option>
                          <option value="Activities">Activities</option>
                       </select>
                    </div>
                  )}
                  {activeTab !== "Tour" && activeTab !== "Activities" && activeTab !== "Transport" && (
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Provider Company</label>
                      <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>
                  )}
                  {activeTab === "Transport" && (
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Manufacturing Year</label>
                      <input type="text" name="duration" placeholder="e.g. 2023" value={formData.duration} onChange={handleChange} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>
                  )}
               </div>
               
               {activeTab !== "Transport" && (
                 <div className="p-4 flex gap-4 sm:flex-row flex-col">
                   <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-50 text-sm font-semibold text-primary rounded-xl pl-9 pr-4 py-2 border border-gray-200 focus:border-accent outline-none" />
                      </div>
                   </div>
                   <div className="flex-[3]">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category / Type</label>
                      <div className="relative">
                         <button
                           type="button"
                           onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                           className="w-full bg-white text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-[#cce823] hover:bg-gray-50 transition-colors focus:ring-1 focus:ring-[#cce823] outline-none flex items-center justify-between"
                         >
                           <div className="flex items-center gap-2">
                              {formData.category ? (
                                <>
                                  {(()=>{
                                    const catOpt = categoryOptions[activeTab]?.find(c => c.name === formData.category);
                                    const IconComp = catOpt ? catOpt.icon : Tag;
                                    return <IconComp size={16} className="text-gray-500" />;
                                  })()}
                                  <span>{formData.category}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">Select Category...</span>
                              )}
                           </div>
                           <ChevronDown size={16} className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                         </button>
  
                         {isCategoryDropdownOpen && (
                           <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-xl p-2 z-10 grid grid-cols-1 gap-1">
                              {categoryOptions[activeTab === "Activities" ? "Tour" : activeTab]?.map((cat) => {
                                 const IconComp = cat.icon;
                                 const isSelected = formData.category === cat.name;
                                 return (
                                   <button
                                      key={cat.name}
                                      onClick={() => {
                                         setFormData({...formData, category: cat.name});
                                         setIsCategoryDropdownOpen(false);
                                      }}
                                      type="button"
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all w-full text-left ${isSelected ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                   >
                                      <IconComp size={16} className={isSelected ? 'text-primary' : 'text-gray-400'} /> {cat.name}
                                   </button>
                                 );
                              })}
                           </div>
                         )}
                      </div>
                   </div>
                 </div>
               )}
            </div>

            {/* About this Activity (Defaults) */}
            {activeTab !== "Transport" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-primary text-sm uppercase tracking-widest block">About this activity</h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Only Duration Editable</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                     <p className="text-xs font-bold text-primary">Free cancellation</p>
                     <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Cancel up to 24 hours in advance for a full refund</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Calendar size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                     <p className="text-xs font-bold text-primary">Reserve now & pay later</p>
                     <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Keep your travel plans flexible — book your spot and pay nothing today.</p>
                  </div>
                </div>
                
                {activeTab !== "Spa" && (
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 overflow-hidden">
                    <Clock size={18} className="text-accent shrink-0" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                       <p className="text-xs font-bold text-primary w-32 shrink-0">Duration Setup</p>
                       {activeTab === "Scooter" ? (
                         <select name="duration" value={formData.duration} onChange={handleChange} className="flex-1 bg-white text-sm font-bold text-primary rounded-lg px-3 py-1.5 border border-gray-200 focus:border-accent outline-none w-full">
                           <option value="">Select Duration</option>
                           <option value="Daily">Daily</option>
                           <option value="Weekly">Weekly</option>
                           <option value="Monthly">Monthly</option>
                           <option value="Daily / Weekly / Monthly">Daily / Weekly / Monthly</option>
                         </select>
                       ) : (
                         <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="flex-1 bg-white text-sm font-bold text-primary rounded-lg px-3 py-1.5 border border-gray-200 focus:border-accent outline-none w-full" placeholder={activeTab === "Transport" ? "e.g. 10 Hours" : "e.g. Full Day"} />
                       )}
                    </div>
                  </div>
                )}
                
                {(activeTab === "Tour" || activeTab === "Activities") && (
                  <>
                    <div className="flex items-start gap-4">
                      <Users size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                         <p className="text-xs font-bold text-primary">Live tour guide</p>
                         <p className="text-[11px] font-semibold text-gray-500 mt-0.5">English, Indonesian</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Car size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                         <p className="text-xs font-bold text-primary">Pickup included</p>
                         <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Wait in the hotel lobby 10 minutes before your scheduled pickup time.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            )}

            {/* Dynamic Pricing Engine */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={20} className="text-green-500" />
                  <h3 className="font-extrabold text-primary text-sm uppercase tracking-widest">Pricing Configuration</h3>
               </div>

               {(activeTab === "Tour" || activeTab === "Activities") ? (
                 <div>
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-5">
                      <button onClick={() => setTourPricingType("Per Person")} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tourPricingType === "Per Person" ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Per Person</button>
                      <button onClick={() => setTourPricingType("Per Group")} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${tourPricingType === "Per Group" ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Per Group</button>
                    </div>

                    {tourPricingType === "Per Group" ? (
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Flat Group Price (IDR)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                           <input type="number" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} className="w-full sm:w-1/2 bg-gray-50 text-sm font-semibold text-primary rounded-xl pl-9 pr-4 py-2 border border-gray-200 focus:border-accent outline-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                         {tourTiers.map((tier, index) => (
                           <div key={index} className="flex items-center gap-3">
                             <div className="flex-1 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Person {tier.pax}</div>
                             <div className="relative flex-[2]">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                               <input type="number" placeholder="Price" value={tier.price} 
                                      onChange={(e) => {
                                         const newTiers = [...tourTiers];
                                         newTiers[index].price = e.target.value;
                                         setTourTiers(newTiers);
                                      }}
                                      className="w-full bg-white text-sm font-extrabold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 focus:border-accent outline-none" 
                               />
                             </div>
                             <button onClick={() => setTourTiers(tourTiers.filter((_, i) => i !== index))} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                                <Trash2 size={14} />
                             </button>
                           </div>
                         ))}
                         <button onClick={() => setTourTiers([...tourTiers, { pax: tourTiers.length + 1, price: "" }])} className="text-xs font-bold text-accent bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent/20 transition-all flex items-center gap-1">
                           <Plus size={14} /> Add Person Tier
                         </button>
                      </div>
                    )}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                           <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Enable All-Inclusive Package</label>
                              <p className="text-[11px] text-gray-400 font-medium mt-1">Allows customers to choose an "All-Inclusive" package that covers everything.</p>
                           </div>
                           <div onClick={() => setHasAllInclusive(!hasAllInclusive)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${hasAllInclusive ? 'bg-[#cce823]' : 'bg-gray-200'}`}>
                             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${hasAllInclusive ? 'translate-x-6' : ''}`} />
                           </div>
                        </div>
                        
                        {hasAllInclusive && (
                           <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">All-Inclusive Tiers (IDR)</label>
                                <p className="text-[11px] text-gray-400 font-medium mb-3">All-Inclusive packages are always calculated per person. Define the price for each person count.</p>
                                <div className="space-y-3">
                                   {allInclusiveTiers.map((tier, index) => (
                                     <div key={index} className="flex items-center gap-3">
                                       <div className="flex-1 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Person {tier.pax}</div>
                                       <div className="relative flex-[2]">
                                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                                         <input type="number" placeholder="Total AI Price" value={tier.price} 
                                                onChange={(e) => {
                                                   const newTiers = [...allInclusiveTiers];
                                                   newTiers[index].price = e.target.value;
                                                   setAllInclusiveTiers(newTiers);
                                                }}
                                                className="w-full bg-white text-sm font-extrabold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 focus:border-accent outline-none" 
                                         />
                                       </div>
                                       <button onClick={() => setAllInclusiveTiers(allInclusiveTiers.filter((_, i) => i !== index))} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                                          <Trash2 size={14} />
                                       </button>
                                     </div>
                                   ))}
                                   <button onClick={() => setAllInclusiveTiers([...allInclusiveTiers, { pax: allInclusiveTiers.length + 1, price: "" }])} className="text-xs font-bold text-accent bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent/20 transition-all flex items-center gap-1">
                                     <Plus size={14} /> Add Person Tier
                                   </button>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-200">
                              <div>
                                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">All-Inclusive Title</label>
                                 <input type="text" value={inclusiveTitle} onChange={(e) => setInclusiveTitle(e.target.value)} className="w-full bg-white text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-gray-200 focus:border-accent outline-none" placeholder="e.g. Ubud Tour - All Inclusive Experience" />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">All-Inclusive What's Included</label>
                                 <textarea rows={3} value={inclusiveIncluded} onChange={(e) => setInclusiveIncluded(e.target.value)} className="w-full bg-white text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-gray-200 focus:border-accent outline-none" placeholder="Enter items separated by newlines..." />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">All-Inclusive What's Excluded</label>
                                 <textarea rows={2} value={inclusiveExcluded} onChange={(e) => setInclusiveExcluded(e.target.value)} className="w-full bg-white text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-gray-200 focus:border-accent outline-none" placeholder="Enter items separated by newlines..." />
                              </div>
                              </div>
                           </div>
                        )}
                     </div>
                 </div>
               ) : activeTab === "Scooter" ? (
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Daily Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={scooterPrices.daily} onChange={(e) => setScooterPrices({...scooterPrices, daily: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" />
                       </div>
                    </div>
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Weekly Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={scooterPrices.weekly} onChange={(e) => setScooterPrices({...scooterPrices, weekly: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" />
                       </div>
                    </div>
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Monthly Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={scooterPrices.monthly} onChange={(e) => setScooterPrices({...scooterPrices, monthly: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" />
                       </div>
                    </div>
                 </div>
               ) : activeTab === "Spa" ? (
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">60 Mins Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={spaPrices.min60} onChange={(e) => setSpaPrices({...spaPrices, min60: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="e.g. 250000" />
                       </div>
                    </div>
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">90 Mins Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={spaPrices.min90} onChange={(e) => setSpaPrices({...spaPrices, min90: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="e.g. 350000" />
                       </div>
                    </div>
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">120 Mins Price (IDR)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                          <input type="number" value={spaPrices.min120} onChange={(e) => setSpaPrices({...spaPrices, min120: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="e.g. 450000" />
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="w-full sm:w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Price per Km (IDR)</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                       <input type="number" value={transportPricePerKm} onChange={(e) => setTransportPricePerKm(e.target.value)} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-10 pr-4 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="e.g. 6500" />
                    </div>
                 </div>
               )}
            </div>

            {/* Rich Details & dynamic sections based on category */}
            {activeTab !== "Transport" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              {activeTab !== "Spa" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Description</label>
                  <textarea rows="4" name="description" value={details.description} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Write the main description..."></textarea>
                </div>
              )}

              {(activeTab === "Tour" || activeTab === "Activities") && (
                <>
                  <div className="flex gap-4 sm:flex-row flex-col">
                     <div className="flex-[2]">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">What's Included</label>
                       <textarea rows="3" name="included" value={details.included} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Hotel pickup, guide, water..."></textarea>
                     </div>
                     <div className="flex-[2]">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">What's Excluded</label>
                       <textarea rows="3" name="excluded" value={details.excluded} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Personal expenses, meals not listed..."></textarea>
                     </div>
                     <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Highlights</label>
                       <textarea rows="3" name="highlights" value={details.highlights} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Swim with mantas..."></textarea>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Tour Itinerary</label>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {itinerary.map((item, index) => (
                        <div key={index} className="relative flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-[#cce823] flex items-center justify-center font-bold text-[10px] text-primary shrink-0 z-10 mt-1">{index + 1}</div>
                          <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                             <input type="text" placeholder="Title (e.g. 08:00 AM - Hotel Pickup)" value={item.title} onChange={(e) => {
                               const newItin = [...itinerary]; newItin[index].title = e.target.value; setItinerary(newItin);
                             }} className="w-full bg-white text-sm font-bold text-primary rounded-lg px-3 py-1.5 border border-gray-200 mb-2 outline-none focus:border-accent" />
                             <textarea rows="2" placeholder="Description..." value={item.description} onChange={(e) => {
                               const newItin = [...itinerary]; newItin[index].description = e.target.value; setItinerary(newItin);
                             }} className="w-full bg-white text-sm font-medium text-gray-600 rounded-lg px-3 py-1.5 border border-gray-200 outline-none focus:border-accent"></textarea>
                          </div>
                          <button onClick={() => setItinerary(itinerary.filter((_, i) => i !== index))} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 mt-1 shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setItinerary([...itinerary, { title: '', description: '' }])} className="mt-4 text-xs font-bold text-primary bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1 mx-auto">
                      <Plus size={14} /> Add Itinerary Stop
                    </button>
                  </div>
                </>
              )}

              {activeTab === "Spa" && (
                <div className="flex gap-4 sm:flex-row flex-col">
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Treatment Description</label>
                     <textarea rows="5" name="description" value={details.description} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Describe the massage or spa package in detail..."></textarea>
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Therapeutic Benefits</label>
                     <textarea rows="5" name="highlights" value={details.highlights} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Muscle relaxation, deep skin cleanse, stress relief..."></textarea>
                   </div>
                </div>
              )}

              {activeTab === "Scooter" && (
                <div className="flex gap-4 sm:flex-row flex-col">
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">What's Included</label>
                     <textarea rows="3" name="included" value={details.included} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="2 Helmets, Raincoat, First Aid..."></textarea>
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Rental Requirements</label>
                     <textarea rows="3" name="highlights" value={details.highlights} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="International drove permit, Passport copy..."></textarea>
                   </div>
                </div>
              )}

              {activeTab === "Transport" && (
                <div className="flex gap-4 sm:flex-row flex-col">
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Vehicle Specifications</label>
                     <textarea rows="3" name="included" value={details.included} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Capacity: 4 Pax, Air Conditioned, Free WiFi..."></textarea>
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Luggage & Rules</label>
                     <textarea rows="3" name="highlights" value={details.highlights} onChange={handleDetailChange} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-4 border border-gray-200 outline-none focus:border-accent" placeholder="Max 2 large suitcases. No smoking..."></textarea>
                   </div>
                </div>
              )}
            </div>
            )}

            {/* Advanced Image Loader (GyG Style) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-primary text-sm uppercase tracking-widest flex items-center gap-2"><ImageIcon size={18} className="text-accent" /> Media Management</h3>
                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                      {activeTab === "Transport" ? "Upload a single striking cover image for this vehicle." : "Upload a striking cover image and up to 8 gallery shots."}
                    </p>
                  </div>
                  {activeTab !== "Transport" && (
                  <div className="relative overflow-hidden">
                     <button type="button" disabled={isUploading} className={`${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-primary text-white hover:bg-primary/95'} px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors`}>
                        <Plus size={16} /> {isUploading ? 'Uploading...' : 'Add Gallery Shots'}
                     </button>
                     <input 
                       type="file" 
                       multiple 
                       accept="image/*"
                       onChange={handleGalleryUpload} 
                       disabled={isUploading}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                     />
                  </div>
                  )}
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Cover Image Block */}
                  <div className="col-span-2 sm:col-span-2 md:col-span-2 row-span-2 relative group overflow-hidden bg-gray-50 rounded-xl border-2 border-accent border-dashed aspect-[4/3] flex flex-col items-center justify-center">
                     {formData.image ? (
                        <>
                          <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">Main Cover</div>
                          
                          <div className="absolute right-3 top-3 flex items-center gap-2">
                             <div className="relative overflow-hidden w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white text-gray-600">
                               <Camera size={14} />
                               <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                             <button onClick={() => setFormData({...formData, image: ""})} className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors">
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </>
                     ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 hover:text-accent transition-colors hover:bg-gray-100/50">
                           <Camera size={32} className="mb-2 opacity-50" />
                           <p className="text-xs font-bold text-gray-600">Upload Cover Image</p>
                           <p className="text-[10px] font-medium mt-1">16:9 ratio recommended for best display</p>
                           <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                     )}
                  </div>

                  {/* Gallery Blocks */}
                  {activeTab !== "Transport" && gallery.map((url, index) => {
                     // Filter out empty links just for display mapping initially, but the state has empty strings, 
                     // so we only render filled blocks or placeholders up to 5.
                     return url ? (
                       <div key={index} className="relative group overflow-hidden bg-gray-100 rounded-xl border border-gray-200 aspect-[4/3]">
                          <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                          <button onClick={() => {
                             const newG = [...gallery];
                             newG[index] = "";
                             setGallery(newG);
                          }} className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-red-50 hover:text-red-500 text-gray-600 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                             <Trash2 size={12} />
                          </button>
                       </div>
                     ) : null;
                  })}
                  
                  {/* Empty Slots */}
                  {activeTab !== "Transport" && Array.from({ length: 8 - gallery.filter(Boolean).length }).map((_, emptyIndex) => (
                      <div key={`empty-${emptyIndex}`} className="relative group overflow-hidden bg-white rounded-xl border border-gray-200 border-dashed aspect-[4/3] flex flex-col items-center justify-center text-gray-300 hover:text-primary transition-colors hover:bg-gray-50">
                         <Plus size={20} className="mb-1" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Gallery {gallery.filter(Boolean).length + emptyIndex + 1}</span>
                         <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                  ))}
               </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 sm:p-6 bg-white border-t border-gray-100 shrink-0 flex items-center justify-end gap-3 pb-safe">
           <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/95 transition-colors flex items-center gap-2 shadow-md">
             <Save size={18} /> Publish Configuration
           </button>
        </div>

      </div>
    </div>
  );
}
