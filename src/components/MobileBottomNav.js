"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User, Heart } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "home", icon: Home, path: "/" },
    { id: "explore", icon: Compass, path: "/tours" },
    { id: "user", icon: User, path: "/profile" },
    { id: "saved", icon: Heart, path: "/saved" },
  ];

  return (
    <div 
      className="fixed left-0 right-0 z-50 flex justify-center px-4 md:hidden"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-full shadow-pill px-6 py-3 flex items-center justify-between w-full max-w-sm border border-black/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.id} href={item.path} className="relative flex flex-col items-center justify-center">
              <div 
                className={`flex flex-col items-center justify-center transition-all duration-200 mt-1 ${
                  isActive ? "text-accent" : "text-text-secondary hover:text-primary"
                }`}
              >
                <Icon size={26} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? "fill-blue-50" : "fill-transparent"} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-primary" : "text-text-secondary"}`}>{item.id}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
