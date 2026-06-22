"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, Navigation, MessageCircle, CalendarCheck, XCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSession, signIn, signOut } from "next-auth/react";

const formatIDR = (num) => {
  if (!num || isNaN(num)) return num;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { data: session, status } = useSession();
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (session?.user?.email) {
       fetchBookings(session.user.email);
    } else {
       setBookings([]);
       setLoadingBookings(false);
    }
  }, [session]);

  const fetchBookings = async (email) => {
    setLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('details->>customer_email', email) // search the JSONB details column for the email
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleCancelBooking = async (bookingId) => {
    try {
       const { error } = await supabase
          .from('bookings')
          .update({ status: 'Cancelled' })
          .eq('id', bookingId); // Cannot reliably check user_id anymore, so just update.
       
       if (error) throw error;
       setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "Cancelled" } : b));
    } catch (err) {
       alert("Could not cancel booking: " + err.message);
    }
  };

  const getBookingType = (b) => {
    const bookingDate = new Date(b.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (b.status === "Cancelled") return "past";
    return bookingDate < today ? "past" : "upcoming";
  };

  if (status === "loading" || (status === "authenticated" && loadingBookings)) {
     return <div className="min-h-[100dvh] flex items-center justify-center bg-white"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div></div>;
  }

  if (status === "unauthenticated") {
     return (
        <div className="min-h-[100dvh] bg-white pb-32 font-sans flex flex-col items-center justify-center px-6 text-center">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
             <CalendarCheck className="w-8 h-8 text-primary" strokeWidth={2} />
           </div>
           <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-3">Your Bali Trips</h1>
           <p className="text-gray-500 font-medium mb-8 max-w-sm">Sign in with your Google account to view your upcoming and past bookings with mybalidriver.</p>
           <button onClick={() => signIn('google')} className="flex items-center justify-center gap-3 w-full max-w-xs bg-white border border-gray-200 text-primary font-bold py-4 rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
           </button>
        </div>
     );
  }

  const filteredBookings = bookings.filter(b => getBookingType(b) === activeTab);

  return (
    <div className="min-h-[100dvh] bg-white pb-32 font-sans overflow-x-hidden">
      
      {/* Header & Tabs */}
      <div className="px-6 pt-12 pb-2 bg-white relative z-10 sticky top-0 border-b border-gray-100">
        <div className="flex justify-between items-center">
           <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Trips</h1>
           <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500">
             <LogOut size={16} />
           </button>
        </div>
        
        <div className="flex mt-6 gap-6">
          <button 
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 text-[15px] font-bold transition-all relative ${activeTab === "upcoming" ? "text-primary" : "text-gray-400"}`}
          >
            Upcoming
            {activeTab === "upcoming" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("past")}
            className={`pb-3 text-[15px] font-bold transition-all relative ${activeTab === "past" ? "text-primary" : "text-gray-400"}`}
          >
            Past
            {activeTab === "past" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Bookings Grid (Airbnb Style) */}
      <div className="px-6 pt-8 max-w-6xl mx-auto">
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBookings.map((b, index) => {
              const details = b.details || {};
              // Clean amount format
              const cleanAmount = String(b.amount).replace(/[^0-9]/g, '');
              const numericAmount = cleanAmount ? parseInt(cleanAmount) : 0;
              
              // Map placeholder images per category
              let fallbackImage = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80";
              if (b.category === "Spa") fallbackImage = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80";
              if (b.category === "Transport") fallbackImage = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80";
              
              const imageToDisplay = details.image || fallbackImage;

              return (
              <div key={b.id} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden group bg-gray-100">
                  <img src={imageToDisplay} alt={b.service_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    {b.status === "Confirmed" && <CheckCircle2 size={14} className="text-green-600" strokeWidth={3} />}
                    {b.status === "Pending" && <Clock size={14} className="text-orange-500" strokeWidth={3} />}
                    {b.status === "Completed" && <CheckCircle2 size={14} className="text-gray-500" strokeWidth={3} />}
                    {b.status === "Cancelled" && <XCircle size={14} className="text-red-500" strokeWidth={3} />}
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${b.status === "Confirmed" ? "text-green-700" : b.status === "Completed" ? "text-gray-600" : b.status === "Cancelled" ? "text-red-600" : "text-orange-600"}`}>
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col px-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-[18px] text-primary leading-tight line-clamp-2">
                      {typeof b.service_name === 'object' ? JSON.stringify(b.service_name) : b.service_name}
                    </h3>
                  </div>
                  
                  <p className="text-[15px] text-gray-500 font-medium mt-1">
                    {typeof b.category === 'object' ? JSON.stringify(b.category) : b.category} • {typeof b.booking_date === 'object' ? JSON.stringify(b.booking_date) : b.booking_date}
                  </p>
                  
                  <div className="mt-1 font-semibold text-[15px] text-primary">
                    <span className="font-extrabold text-[15px]">{numericAmount > 0 ? formatIDR(numericAmount) : (typeof b.amount === 'object' ? JSON.stringify(b.amount) : b.amount)}</span>
                  </div>

                  {/* Actions Area */}
                  {activeTab === "upcoming" && (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
                      <a 
                        href={`https://wa.me/6282247819449?text=${encodeURIComponent(`Hello mybalidriver, regarding my booking:\n\n*mybalidriver BOOKING*\n\n*ID:* #${b.id}\n*TITLE:* ${b.service_name.toUpperCase()}\n*DATE:* ${b.booking_date}\n*PRICE:* ${b.amount}\n\nPlease assist me to confirm.`)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 bg-gray-100 text-primary text-[14px] font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-center"
                      >
                        Message
                      </a>
                      {b.status === "Pending" && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="flex-1 bg-white border border-red-200 text-red-500 text-[14px] font-bold py-3.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}

                  {/* Cancelled state label if in past */}
                  {b.status === "Cancelled" && activeTab === "past" && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl text-center">
                      Booking Cancelled
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center px-4">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <Navigation className="w-10 h-10 text-gray-300 ml-1 mt-1" strokeWidth={2} />
             </div>
             <h3 className="text-[22px] font-black text-primary mb-3 tracking-tight">No upcoming trips</h3>
             <p className="text-gray-500 text-[15px] max-w-[280px] leading-relaxed mb-8 font-medium">
               Start exploring our collection of premium tours, transport, and experiences in Bali.
             </p>
             <Link href="/">
               <button className="px-8 py-4 bg-[#1C1C1E] text-white font-extrabold rounded-full hover:bg-black active:scale-95 shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.18)] transition-all text-[15px] w-full max-w-[240px]">
                 Start Exploring
               </button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

