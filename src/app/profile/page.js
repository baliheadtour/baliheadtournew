"use client";

import React from "react";
import { User, Settings, HelpCircle, LogOut, ChevronRight, Bell, CalendarCheck, Heart, CircleUser, Briefcase } from "lucide-react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const menuItems = [
    { icon: User, label: "Personal Information", path: "/profile/personal-info" },
    { icon: CalendarCheck, label: "My Bookings", path: "/bookings", mobileHide: true },
    { icon: Heart, label: "Wishlist & Favorites", path: "/favorites", mobileHide: true },
    { icon: HelpCircle, label: "Help Center", path: "#" },
    { icon: Briefcase, label: "Become a Partner", path: "#", desktopHide: true },
  ];

  if (status === "loading") {
    return <div className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center font-bold text-primary animate-pulse">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] pb-32 font-sans font-medium flex flex-col items-center justify-center px-6 text-center">
        <CircleUser size={64} className="text-gray-300 mb-6" />
        <h1 className="text-2xl font-extrabold text-primary mb-3">Profile</h1>
        <p className="text-text-secondary text-sm mb-8">Sign in to view your profile, manage bookings, and access your wishlist.</p>
        <button onClick={() => signIn('google')} className="w-full max-w-sm flex items-center justify-center gap-2 p-4 bg-primary text-white font-bold rounded-full shadow-md active:scale-95 transition-transform">
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-32 font-sans font-medium">
      <div className="px-6 pt-16 pb-8 bg-white shadow-sm border-b border-border">
        <h1 className="text-2xl font-extrabold text-primary mb-8">Profile</h1>
        
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-accent rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <img src={session.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} referrerPolicy="no-referrer" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">{session.user?.name || "Guest User"}</h2>
            <p className="text-text-secondary text-sm mt-0.5">{session.user?.email || ""}</p>
            <div className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-md inline-block mt-2">
              Premium Member
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <Link 
                key={index} 
                href={item.path} 
                className={`items-center justify-between p-5 transition-colors hover:bg-gray-50 cursor-pointer border-b border-border last:border-b-0 ${item.mobileHide ? 'hidden md:flex' : item.desktopHide ? 'flex md:hidden' : 'flex'}`}
              >
                <div className="flex items-center gap-4 text-primary">
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="font-bold text-[15px]">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-text-secondary" />
              </Link>
            );
          })}
        </div>

        <button onClick={() => signOut()} className="w-full mt-8 flex items-center justify-center gap-2 p-5 bg-white text-red-500 font-bold rounded-3xl shadow-sm border border-border transition-colors hover:bg-red-50 active:bg-red-100">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
