"use client";

import React, { useState, useEffect } from "react";
import { Users, DollarSign, Calendar, MapPin, TrendingUp, ChevronRight, Activity, Download } from "lucide-react";
import { TourIcon, SpaIcon, ScooterIcon, TransportIcon } from "../../components/icons/CategoryIcons";
import HeroSettingsModal from "../../components/admin/HeroSettingsModal";
import { supabase } from "@/lib/supabase";

const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default function AdminDashboard() {
  const [activeCategory, setActiveCategory] = useState("Tour");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setAllBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Confirmed' })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update booking');
      }
      
      // Update local state
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: 'Confirmed' }));
      }
    } catch (err) {
      alert("Failed to confirm booking: " + err.message);
    }
  };

  const getStats = (category) => {
    const categoryBookings = allBookings.filter(b => 
       category === "Tour" ? (b.category === "Tour" || !b.category) : b.category === category
    );

    const confirmed = categoryBookings.filter(b => b.status === "Confirmed" || b.status === "Completed");
    
    // Calculate total revenue
    const revenue = confirmed.reduce((sum, b) => {
      const cleanAmount = String(b.amount).replace(/[^0-9]/g, '');
      return sum + (parseInt(cleanAmount) || 0);
    }, 0);

    // Calculate total participants
    const participants = categoryBookings.reduce((sum, b) => {
       const pax = parseInt(b.details?.guests || b.details?.pax || 1);
       return sum + (isNaN(pax) ? 1 : pax);
    }, 0);

    return [
      { label: "Gross Revenue", value: revenue > 0 ? formatIDR(revenue) : "Rp 0", trend: "+0.0%", icon: DollarSign },
      { label: "Confirmed Bookings", value: confirmed.length.toString(), trend: "+0.0%", icon: Calendar },
      { label: "Total Participants", value: participants.toString(), trend: "+0.0%", icon: Users },
      { label: "Total Inquiries", value: categoryBookings.length.toString(), trend: "+0.0%", icon: MapPin },
    ];
  };

  const currentBookings = allBookings.filter(b => 
     activeCategory === "Tour" ? (b.category === "Tour" || !b.category) : b.category === activeCategory
  );

  const currentStats = getStats(activeCategory);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track your product portfolio performance and bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsHeroModalOpen(true)} className="flex items-center gap-2 bg-[#1C1C1E] text-[#D9FB41] px-5 py-2.5 rounded-xl text-sm font-extrabold hover:bg-black transition-colors shadow-sm active:scale-95">
             Edit Homepage Hero
          </button>
          <button className="hidden sm:flex items-center gap-2 bg-white border border-[#E8EAEF] text-[#1C1C1E] px-5 py-2.5 rounded-xl text-sm font-extrabold hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
             <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Styled Category Tabs */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x">
          <button 
          onClick={() => setActiveCategory("Tour")}
          className={`snap-center shrink-0 flex items-center justify-center gap-3 px-6 h-14 rounded-2xl font-extrabold shadow-sm active:scale-95 transition-all ${activeCategory === "Tour" ? "bg-[#1C1C1E] text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-[#E8EAEF]"}`}>
            <TourIcon size={20} strokeWidth={2.5} className={activeCategory === "Tour" ? "text-[#D9FB41]" : "text-gray-400"} />
            <span className="text-[13px] tracking-wide">Tour Dashboard</span>
          </button>
          <button 
          onClick={() => setActiveCategory("Activities")}
          className={`snap-center shrink-0 flex items-center justify-center gap-3 px-6 h-14 rounded-2xl font-extrabold shadow-sm active:scale-95 transition-all ${activeCategory === "Activities" ? "bg-[#1C1C1E] text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-[#E8EAEF]"}`}>
            <span className="text-[13px] tracking-wide">Activities</span>
          </button>
          <button 
          onClick={() => setActiveCategory("Transport")}
          className={`snap-center shrink-0 flex items-center justify-center gap-3 px-6 h-14 rounded-2xl font-extrabold shadow-sm active:scale-95 transition-all ${activeCategory === "Transport" ? "bg-[#1C1C1E] text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-[#E8EAEF]"}`}>
            <TransportIcon size={20} strokeWidth={2.5} className={activeCategory === "Transport" ? "text-[#D9FB41]" : "text-gray-400"} />
            <span className="text-[13px] tracking-wide">Transports</span>
          </button>
      </div>
      
      {/* Soft Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {currentStats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.includes('+');
          const isNeutral = stat.trend === '0.0%';
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-[#E8EAEF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col group hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-4 text-gray-500">
                <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeCategory === 'Tour' ? 'bg-[#F8F9FA]' : 'bg-[#F8F9FA]'} group-hover:bg-[#1C1C1E] group-hover:text-[#D9FB41] transition-colors`}>
                  <Icon size={20} strokeWidth={2.5} className={activeCategory === 'Tour' ? "text-[#1C1C1E] group-hover:text-[#D9FB41]" : "text-[#1C1C1E] group-hover:text-[#D9FB41]"} />
                </div>
              </div>
              <h4 className="text-[26px] font-black text-[#1C1C1E] mb-2 tracking-tight">{stat.value}</h4>
              <div className="mt-auto">
                 <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-lg
                   ${isPositive ? 'bg-green-50 text-green-700' : isNeutral ? 'bg-gray-50 text-gray-500' : 'bg-red-50 text-red-600'}
                 `}>
                   {isPositive && <TrendingUp size={12} strokeWidth={3} />}
                   {stat.trend} <span className="font-semibold opacity-70">vs last month</span>
                 </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modern Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E8EAEF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        
        <div className="flex justify-end p-4 border-b border-[#E8EAEF]">
          <button onClick={fetchBookings} className="text-sm font-extrabold text-[#1C1C1E] hover:text-gray-500 flex items-center gap-1 transition-colors">
             Refresh Data <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
        
        <div className="overflow-x-hidden">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-[#F8F9FA] text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#E8EAEF]">
                   <th className="px-6 py-4">Reference</th>
                   <th className="px-6 py-4 hidden sm:table-cell">Customer</th>
                   <th className="px-6 py-4 hidden md:table-cell">Product Selected</th>
                   <th className="px-6 py-4 hidden lg:table-cell">Timestamp</th>
                   <th className="px-6 py-4 text-right">Amount</th>
                   <th className="px-6 py-4 text-center hidden sm:table-cell">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#E8EAEF] text-sm">
                {currentBookings.length === 0 && !loading && (
                   <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-bold">No bookings found in this category.</td>
                   </tr>
                )}
                {loading && (
                   <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-bold">Loading live database...</td>
                   </tr>
                )}
                {currentBookings.map((booking, i) => (
                  <tr key={booking.id} onClick={() => setSelectedBooking(booking)} className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer active:bg-gray-100">
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white border border-[#E8EAEF] shadow-sm flex items-center justify-center text-[#1C1C1E] font-black text-xs shrink-0 group-hover:bg-[#1C1C1E] group-hover:text-[#D9FB41] transition-colors">
                              {booking.id.substring(3, 7)}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-extrabold text-[#1C1C1E]">{booking.id}</span>
                              <span className="text-[11px] font-bold text-gray-400">{typeof booking.booking_date === 'object' ? JSON.stringify(booking.booking_date) : booking.booking_date}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-gray-600 font-bold">{typeof booking.customer_name === 'object' ? JSON.stringify(booking.customer_name) : booking.customer_name}</td>
                     <td className="px-6 py-4 text-[#1C1C1E] font-bold hidden md:table-cell">
                        {typeof booking.service_name === 'object' ? JSON.stringify(booking.service_name) : booking.service_name}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium hidden lg:table-cell">{new Date(booking.created_at || Date.now()).toLocaleDateString()}</td>
                     <td className="px-6 py-4 whitespace-nowrap font-black text-[#1C1C1E] text-right">{typeof booking.amount === 'object' ? JSON.stringify(booking.amount) : booking.amount}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                          ${booking.status === 'Confirmed' ? 'bg-[#D9FB41] text-[#1C1C1E]' : ''}
                          ${booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' : ''}
                          ${booking.status === 'Completed' ? 'bg-gray-100 text-gray-500' : ''}
                          ${booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' : ''}
                        `}>
                          {booking.status}
                        </span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* Tap-to-Expand Mobile Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans px-4">
          <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10 animate-scaleIn max-h-[90dvh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1C1C1E] break-all">{selectedBooking.id}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{typeof selectedBooking.customer_name === 'object' ? JSON.stringify(selectedBooking.customer_name) : selectedBooking.customer_name} • {typeof selectedBooking.contact_info === 'object' ? JSON.stringify(selectedBooking.contact_info) : selectedBooking.contact_info}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                    ${selectedBooking.status === 'Confirmed' ? 'bg-[#D9FB41] text-[#1C1C1E]' : ''}
                    ${selectedBooking.status === 'Pending' ? 'bg-amber-100 text-amber-800' : ''}
                    ${selectedBooking.status === 'Completed' ? 'bg-gray-100 text-gray-500' : ''}
                    ${selectedBooking.status === 'Cancelled' ? 'bg-red-100 text-red-600' : ''}
                `}>
                    {selectedBooking.status}
                </span>
             </div>
             
             <div className="space-y-4 mb-6 border-y border-[#E8EAEF] py-4">
               <div>
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Product Selected</p>
                 <p className="text-sm font-bold text-[#1C1C1E]">{typeof selectedBooking.service_name === 'object' ? JSON.stringify(selectedBooking.service_name) : selectedBooking.service_name}</p>
               </div>
               <div className="flex justify-between">
                 <div>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Date</p>
                   <p className="text-sm font-bold text-[#1C1C1E]">{typeof selectedBooking.booking_date === 'object' ? JSON.stringify(selectedBooking.booking_date) : selectedBooking.booking_date}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Amount</p>
                   <p className="text-sm font-black text-[#1C1C1E]">{typeof selectedBooking.amount === 'object' ? JSON.stringify(selectedBooking.amount) : selectedBooking.amount}</p>
                 </div>
               </div>
             </div>

             {selectedBooking.details && typeof selectedBooking.details === 'object' && (
               <div className="mb-6 p-4 bg-[#F8F9FA] rounded-2xl border border-[#E8EAEF]">
                 <p className="text-[10px] font-extrabold text-[#1C1C1E] uppercase tracking-widest mb-3">Customer Form Details</p>
                 <div className="space-y-3">
                   {Object.entries(selectedBooking.details).map(([key, value]) => {
                     if (key.toLowerCase() === 'image' || key.toLowerCase() === 'iswishlist' || key.toLowerCase() === 'duration') return null;
                     
                     let displayValue = value;
                     if (typeof value === 'object') {
                       displayValue = JSON.stringify(value);
                     }
                     
                     return (
                       <div key={key} className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight mb-1">{key.replace(/_/g, ' ')}</span>
                         <span className="text-[14px] font-extrabold text-[#1C1C1E] leading-tight break-words">
                            {displayValue || '-'}
                         </span>
                       </div>
                     );
                   })}
                   {(!selectedBooking.details || !selectedBooking.details.special_requests) && (
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight mb-1">SPECIAL REQUESTS</span>
                       <span className="text-[14px] font-extrabold text-[#1C1C1E] leading-tight break-words">
                          None specified
                       </span>
                     </div>
                   )}
                 </div>
               </div>
             )}
             <div className="flex gap-3 mt-6">
               <button onClick={() => setSelectedBooking(null)} className="flex-1 py-3 bg-[#F8F9FA] text-[#1C1C1E] font-extrabold rounded-xl hover:bg-gray-100 transition-colors">Close</button>
               {selectedBooking.status === 'Pending' && (
                  <button 
                    onClick={() => handleConfirmBooking(selectedBooking.id)} 
                    className="flex-1 py-3 bg-[#1C1C1E] text-[#D9FB41] font-extrabold rounded-xl hover:bg-black transition-colors"
                  >
                    Confirm
                  </button>
               )}
             </div>
          </div>
        </div>
      )}

      {isHeroModalOpen && <HeroSettingsModal onClose={() => setIsHeroModalOpen(false)} />}
    </div>
  );
}
