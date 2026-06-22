"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Users, Phone, User, Clock, ArrowRight, ChevronLeft, Minus, Plus, Check, Info } from "lucide-react";
import WeeklyCalendar from "./WeeklyCalendar";
import LocationAutocomplete from "./LocationAutocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

const formatIDR = (num) => `IDR ${Number(num).toLocaleString('id-ID')}`;

export default function BookingModal({ isOpen, onClose, serviceData, initialPax = 1, initialDate = "", startStep = 1, onPackageChange, onPaxChange, onDateChange }) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBvRg3xJ6dSPKSOwTRSmGUmaEfYRQ5WRCQ";
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [localPackage, setLocalPackage] = useState("Standard");
  const { data: session } = useSession();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: String(initialPax),
    duration: "1",
    pickupLocation: { name: "", url: "" },
    dropoffLocation: { name: "", url: "" },
  });

  useEffect(() => {
    if (isOpen) {
      setStep(startStep);
      const minP = serviceData?.minPax || 1;
      setFormData(prev => ({ 
        ...prev, 
        guests: String(Math.max(minP, initialPax)),
        date: initialDate || prev.date
      }));
      setLocalPackage(serviceData?.selectedPackage || "Standard");
    }
  }, [isOpen, initialPax, initialDate, startStep, serviceData]);

  const handlePackageSelect = (pkg) => {
    setLocalPackage(pkg);
    if (onPackageChange) onPackageChange(pkg);
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = (newGuests) => {
    const minP = serviceData?.minPax || 1;
    const finalGuests = Math.max(minP, newGuests);
    setFormData(prev => ({ ...prev, guests: String(finalGuests) }));
    if (onPaxChange) onPaxChange(finalGuests);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Generate Random Booking ID
    const bookingId = `DB-${Math.floor(100000 + Math.random() * 900000)}`;
    const sType = serviceData?.type?.toUpperCase() || "SERVICE";
    const sTitle = serviceData?.title?.toUpperCase() || "UNKNOWN";
    const divider = "━━━━━━━━━━━━━━━━━━━━━━";
    
    let messageDetails = `*MYBALIDRIVER BOOKING*\n${divider}\n*BOOKING ID:* #${bookingId}\n*SERVICE:* ${sType}\n*TITLE:* ${sTitle}\n${divider}\n*NAME:* ${formData.name}\n*WHATSAPP:* ${formData.phone}\n*DATE:* ${formData.date}`;
    
    if (serviceData?.type === "tour" || serviceData?.type === "activities") {
      messageDetails += `\n*PACKAGE:* ${localPackage}`;
    }
    
    if (serviceData?.type === "tour") {
      messageDetails += `\n*GUESTS:* ${formData.guests} Pax\n*PICKUP:* ${formData.pickupLocation.name}`;
      if (formData.pickupLocation.coords) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${formData.pickupLocation.coords[0]},${formData.pickupLocation.coords[1]}`;
      } else if (formData.pickupLocation.name) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${encodeURIComponent(formData.pickupLocation.name + " Bali")}`;
      }
    } else if (serviceData?.type === "spa") {
      messageDetails += `\n*TIME:* ${formData.time}\n*GUESTS:* ${formData.guests} Pax\n*LOCATION:* ${formData.pickupLocation.name}`;
      if (formData.pickupLocation.coords) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${formData.pickupLocation.coords[0]},${formData.pickupLocation.coords[1]}`;
      } else if (formData.pickupLocation.name) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${encodeURIComponent(formData.pickupLocation.name + " Bali")}`;
      }
    } else if (serviceData?.type === "scooter") {
      messageDetails += `\n*DURATION:* ${formData.duration} Days\n*DELIVERY LOC:* ${formData.pickupLocation.name}`;
      if (formData.pickupLocation.coords) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${formData.pickupLocation.coords[0]},${formData.pickupLocation.coords[1]}`;
      } else if (formData.pickupLocation.name) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${encodeURIComponent(formData.pickupLocation.name + " Bali")}`;
      }
    } else if (serviceData?.type === "transport") {
      messageDetails += `\n*TIME:* ${formData.time}\n*PASSENGERS:* ${formData.guests} Pax\n*PICKUP:* ${formData.pickupLocation.name}`;
      if (formData.pickupLocation.coords) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${formData.pickupLocation.coords[0]},${formData.pickupLocation.coords[1]}`;
      } else if (formData.pickupLocation.name) {
         messageDetails += `\n*MAPS:* https://maps.google.com/?q=${encodeURIComponent(formData.pickupLocation.name + " Bali")}`;
      }
      messageDetails += `\n*DROPOFF:* ${formData.dropoffLocation.name}`;
      if (formData.dropoffLocation.coords) {
         messageDetails += `\n*DESTINATION MAPS:* https://maps.google.com/?q=${formData.dropoffLocation.coords[0]},${formData.dropoffLocation.coords[1]}`;
      } else if (formData.dropoffLocation.name) {
         messageDetails += `\n*DESTINATION MAPS:* https://maps.google.com/?q=${encodeURIComponent(formData.dropoffLocation.name + " Bali")}`;
      }
    }

    let total = 0;
    
    // Calculate Total correctly
      const getMultiplierPrice = (rawPrice) => {
        const p = Number(rawPrice);
        if (!p) return 0;
        return Math.floor(p > 1000 ? p : p * 1000);
      };

      let pax = parseInt(formData.guests) || 1;
      let basePrice = getMultiplierPrice(serviceData.price);
      
      // Handle All Inclusive Surcharge if selected
      if (localPackage === 'All Inclusive') {
         basePrice = getMultiplierPrice(serviceData.allInclusiveSurcharge) || basePrice;
         if (serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) {
            let sortedTiers = [...serviceData.allInclusiveTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
            let applicableTier = sortedTiers.find(t => pax >= Number(t.pax));
            if (applicableTier) basePrice = getMultiplierPrice(applicableTier.price);
         }
      } else if (serviceData.tourTiers && serviceData.tourTiers.length > 0) {
         let sortedTiers = [...serviceData.tourTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
         let applicableTier = sortedTiers.find(t => pax >= Number(t.pax));
         if (applicableTier) basePrice = getMultiplierPrice(applicableTier.price);
      }
      
      if (serviceData.type === 'scooter') {
         total = basePrice * (parseInt(formData.duration) || 1);
      } else if (["tour", "spa", "transport", "activities"].includes(serviceData?.type?.toLowerCase())) {
         if (localPackage === 'All Inclusive') {
             if (serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) {
                 total = basePrice;
             } else {
                 total = basePrice * pax;
             }
         } else if (serviceData?.tourTiers && serviceData.tourTiers.length > 0) {
             total = basePrice;
         } else {
             let isGroupPricing = serviceData?.pricingType === "Per Group";
             total = basePrice * (isGroupPricing ? 1 : pax);
         }
      } else {
         total = basePrice;
      }
      
      messageDetails += `\n${divider}\n*TOTAL ESTIMATE:* ${formatIDR(total)}`;

    const waUrl = `https://wa.me/6282247819449?text=${encodeURIComponent(messageDetails)}`;
    
    try {
      // Await the insert so it completes before navigating away
      const { error } = await supabase.from('bookings').insert({
        id: bookingId,
        customer_name: formData.name,
        contact_info: formData.phone,
        service_name: sTitle,
        booking_date: formData.date,
        amount: formatIDR(total),
        status: 'Pending',
        category: serviceData?.type === "tour" ? "Tour" : serviceData?.type === "transport" ? "Transport" : "Activities",
        details: {
          guests: formData.guests,
          package: localPackage,
          time: formData.time,
          duration: formData.duration,
          pickup_location: formData.pickupLocation.name,
          dropoff_location: formData.dropoffLocation.name,
          customer_email: session?.user?.email || null,
          image: serviceData?.image || null
        }
      });
      if (error) console.error("Failed to save booking to Supabase:", error);
    } catch (err) {
      console.error("Booking save error:", err);
    }

    window.location.href = waUrl;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in transition-opacity" onClick={onClose} />
      
      {/* Modal Surface */}
      <div className="relative w-full md:w-[500px] max-h-[90dvh] bg-white rounded-t-[32px] md:rounded-[32px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          {step === 2 && startStep === 1 ? (
            <button onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-primary active:scale-95">
              <ChevronLeft size={20} strokeWidth={2.5} className="pr-0.5" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
          <h2 className="text-[18px] md:text-[20px] font-extrabold text-primary">{step === 1 ? 'Select Participants' : 'Booking Details'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-primary active:scale-95">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content/Form (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          
          {/* Service Summary snippet */}
          {serviceData && (
            <div className="flex gap-4 items-center mb-8 bg-[#F4F4F6] p-3 pl-4 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Calendar className="text-primary" size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{serviceData.type}</p>
                <h3 
                   onClick={onClose}
                   className="font-extrabold text-[15px] text-primary truncate leading-tight cursor-pointer hover:text-accent hover:underline decoration-accent underline-offset-2 transition-all"
                   title="Click to view full details"
                >
                   {localPackage === 'All Inclusive' && serviceData.inclusiveTitle ? serviceData.inclusiveTitle : serviceData.baseTitle || serviceData.title}
                </h3>
              </div>
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleCheckout} id="bookingForm" className="flex flex-col gap-5">
            
            {/* STEP 1: PARTICIPANTS & OPTIONS */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-5">
                  <div className="w-full flex-shrink-0">
                     <WeeklyCalendar value={formData.date} onChange={(dateStr) => {
                       handleInputChange({ target: { name: 'date', value: dateStr }});
                       if (onDateChange) onDateChange(dateStr);
                     }} />
                  </div>

                  {/* Time (for Spa, Transport) */}
                  {(serviceData?.type === "spa" || serviceData?.type === "transport") && (
                    <div className="flex-1 flex flex-col gap-2 relative">
                       <label className="text-[13px] font-bold text-primary ml-1">Preferred Time</label>
                       <div className="relative flex items-center">
                         <Clock className="absolute left-4 text-gray-400" size={18} />
                         <input required type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full bg-[#F4F4F6] rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none" style={{ colorScheme: 'light' }} />
                       </div>
                    </div>
                  )}
                </div>

                {/* Package Selector (Tour/Activities) */}
                {(serviceData?.type === "tour" || serviceData?.type === "activities") && (serviceData?.hasAllInclusive || serviceData?.allInclusiveSurcharge) && (
                  <div className="flex flex-col gap-3 mt-1">
                    <span className="font-bold text-primary text-[14px] ml-1">Select your experience</span>
                    <div className="flex flex-col gap-2">
                      <div 
                         onClick={() => handlePackageSelect('Standard')}
                         className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${localPackage === 'Standard' ? 'border-[#cce823] bg-[#cce823]/10' : 'border-[#F4F4F6] bg-[#F4F4F6] hover:border-gray-200'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary text-[14px]">Standard Journey</span>
                            {localPackage === 'Standard' && <div className="w-5 h-5 rounded-full bg-[#cce823] flex items-center justify-center shadow-sm"><Check size={12} strokeWidth={3} className="text-[#1C1C1E]" /></div>}
                         </div>
                         <p className="text-[12px] text-gray-500 font-medium leading-snug">Essential driver and guide service. Entrance fees are not included.</p>
                      </div>
                      <div 
                         onClick={() => handlePackageSelect('All Inclusive')}
                         className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${localPackage === 'All Inclusive' ? 'border-[#cce823] bg-[#cce823]/10' : 'border-[#F4F4F6] bg-[#F4F4F6] hover:border-gray-200'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary text-[14px]">All-Inclusive Experience</span>
                            <span className="text-[11px] font-extrabold text-[#1C1C1E] bg-[#cce823] px-2 py-0.5 rounded-md shadow-sm">
                              {(() => {
                                const getMultiplierPrice = (rawPrice) => {
                                  const p = Number(rawPrice);
                                  if (!p) return 0;
                                  return Math.floor(p > 1000 ? p : p * 1000);
                                };
                                let pax = parseInt(formData.guests) || 1;
                                let price = getMultiplierPrice(serviceData.allInclusiveSurcharge);
                                if (serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) {
                                  let sortedTiers = [...serviceData.allInclusiveTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
                                  let applicableTier = sortedTiers.find(t => pax >= Number(t.pax));
                                  if (applicableTier) price = getMultiplierPrice(applicableTier.price);
                                }
                                return `Rp ${price.toLocaleString('id-ID')}${(serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) ? '' : '/pax'}`;
                              })()}
                            </span>
                         </div>
                         <p className="text-[12px] text-gray-500 font-medium leading-snug">Everything taken care of. Includes all required tickets and fees for a seamless day.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guests / Pax */}
                {(["tour", "spa", "transport"].includes(serviceData?.type)) && (
                   <div className="flex items-center justify-between mt-1 bg-[#F4F4F6] p-3 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="bg-white p-2 rounded-xl shadow-sm">
                         <Users className="text-primary" size={18} />
                       </div>
                       <span className="font-bold text-primary text-[14px]">Number of Pax</span>
                     </div>
                     <div className="flex items-center gap-4 mr-1">
                       <button 
                         type="button"
                         onClick={() => handleGuestsChange(parseInt(formData.guests || 1) - 1)} 
                         className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                       >
                         <Minus size={16} strokeWidth={3} />
                       </button>
                       <span className="font-extrabold text-primary text-[16px] w-4 text-center">{formData.guests}</span>
                       <button 
                         type="button"
                         onClick={() => handleGuestsChange(parseInt(formData.guests || 1) + 1)} 
                         className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                       >
                         <Plus size={16} strokeWidth={3} />
                       </button>
                     </div>
                   </div>
                )}

                 {/* VW Notification */}
                 {serviceData?.title?.toLowerCase().includes('vw') && parseInt(formData.guests) > 3 && (
                   <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mt-1 shadow-sm">
                     <div className="bg-amber-100 p-1.5 rounded-full shrink-0"><Info className="text-amber-600" size={16} strokeWidth={2.5} /></div>
                     <p className="text-[12px] font-bold text-amber-800 leading-snug pt-0.5">A classic VW Safari fits max 3 passengers. Your group will get multiple cars to travel in a fun convoy!</p>
                   </div>
                 )}

                {/* Duration (Scooter) */}
                {(serviceData?.type === "scooter") && (
                   <div className="flex items-center justify-between mt-1 bg-[#F4F4F6] p-3 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="bg-white p-2 rounded-xl shadow-sm">
                         <Clock className="text-primary" size={18} />
                       </div>
                       <span className="font-bold text-primary text-[14px]">Rental Duration (Days)</span>
                     </div>
                     <div className="flex items-center gap-4 mr-1">
                       <button 
                         type="button"
                         onClick={() => setFormData(p => ({...p, duration: String(Math.max(1, parseInt(p.duration || 1) - 1))}))} 
                         className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                       >
                         <Minus size={16} strokeWidth={3} />
                       </button>
                       <span className="font-extrabold text-primary text-[16px] w-4 text-center">{formData.duration}</span>
                       <button 
                         type="button"
                         onClick={() => setFormData(p => ({...p, duration: String(parseInt(p.duration || 1) + 1)}))} 
                         className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                       >
                         <Plus size={16} strokeWidth={3} />
                       </button>
                     </div>
                   </div>
                )}
              </>
            )}

            {/* STEP 2: PERSONAL & BOOKING DETAILS */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-5">
                <div className="flex flex-col gap-2 relative">
                   <label className="text-[13px] font-bold text-primary ml-1">Full Name</label>
                   <div className="relative flex items-center">
                     <User className="absolute left-4 text-gray-400" size={18} />
                     <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full bg-[#F4F4F6] rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400" />
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                   <label className="text-[13px] font-bold text-primary ml-1">WhatsApp Number</label>
                   <div className="relative flex items-center">
                     <Phone className="absolute left-4 text-gray-400" size={18} />
                     <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+62 812 3456 7890" className="w-full bg-[#F4F4F6] rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400" />
                   </div>
                </div>

                {/* Location (Pickup, Villa, Delivery) */}
                <div className="flex flex-col gap-2 relative mt-1">
                   <label className="text-[13px] font-bold text-primary ml-1">Hotel / Villa</label>
                   <APIProvider apiKey={API_KEY}>
                     <LocationAutocomplete 
                       value={formData.pickupLocation.name}
                       onChange={(val) => setFormData(p => ({ ...p, pickupLocation: val }))}
                       placeholder="e.g. Grand Hyatt Nusa Dua"
                       icon={MapPin}
                     />
                   </APIProvider>
                </div>

                {/* Dropoff Location (Transport only) */}
                {(serviceData?.type === "transport") && (
                   <div className="flex flex-col gap-2 relative mt-1">
                     <label className="text-[13px] font-bold text-primary ml-1">Drop-off Location</label>
                     <APIProvider apiKey={API_KEY}>
                       <LocationAutocomplete 
                         value={formData.dropoffLocation.name}
                         onChange={(val) => setFormData(p => ({ ...p, dropoffLocation: val }))}
                         placeholder="e.g. Ngurah Rai Airport"
                         icon={MapPin}
                       />
                     </APIProvider>
                   </div>
                )}
              </div>
            )}

          </form>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-[32px] mt-auto">
           {serviceData && (
             <div className="flex justify-between items-center mb-4 px-1">
               <span className="text-[14px] font-bold text-gray-500">Expected Total</span>
               <span className="text-[22px] font-extrabold text-primary">
                 {(() => {
                    const getMultiplierPrice = (rawPrice) => {
                      const p = Number(rawPrice);
                      if (!p) return 0;
                      return Math.floor(p > 1000 ? p : p * 1000);
                    };
                    let pax = parseInt(formData.guests) || 1;
                    let basePrice = getMultiplierPrice(serviceData.price);
                    
                    // Handle All Inclusive Surcharge if selected
                    if (localPackage === 'All Inclusive') {
                       basePrice = getMultiplierPrice(serviceData.allInclusiveSurcharge) || basePrice;
                       if (serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) {
                          let sortedTiers = [...serviceData.allInclusiveTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
                          let applicableTier = sortedTiers.find(t => pax >= Number(t.pax));
                          if (applicableTier) basePrice = getMultiplierPrice(applicableTier.price);
                       }
                    } else if (serviceData.tourTiers && serviceData.tourTiers.length > 0) {
                       let sortedTiers = [...serviceData.tourTiers].sort((a, b) => Number(b.pax) - Number(a.pax));
                       let applicableTier = sortedTiers.find(t => pax >= Number(t.pax));
                       if (applicableTier) basePrice = getMultiplierPrice(applicableTier.price);
                    }
                    
                    if (serviceData.type === 'scooter') {
                       return formatIDR(basePrice * (parseInt(formData.duration) || 1));
                    } else if (["tour", "spa", "transport", "activities"].includes(serviceData?.type?.toLowerCase())) {
                       if (localPackage === 'All Inclusive') {
                          if (serviceData.allInclusiveTiers && serviceData.allInclusiveTiers.length > 0) {
                             return formatIDR(basePrice);
                          } else {
                             return formatIDR(basePrice * pax);
                          }
                       } else if (serviceData?.tourTiers && serviceData.tourTiers.length > 0) {
                          return formatIDR(basePrice);
                       } else {
                          let isGroupPricing = serviceData?.pricingType === "Per Group";
                          return formatIDR(basePrice * (isGroupPricing ? 1 : pax));
                       }
                    }
                    return formatIDR(basePrice);
                 })()}
               </span>
             </div>
           )}
           <button form="bookingForm" type="submit" className="w-full bg-accent hover:bg-accent-hover py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-primary transition-all active:scale-95 text-[16px] shadow-sm">
             {step === 1 ? 'Continue to Details' : 'Confirm Request'} <ArrowRight size={18} strokeWidth={2.5} />
           </button>
           <p className="text-center text-[12px] font-medium text-gray-400 mt-4 px-4 leading-snug">
             You will be redirected to WhatsApp to confirm details securely. No payment is required right now.
           </p>
        </div>

      </div>
    </div>
  );
}
