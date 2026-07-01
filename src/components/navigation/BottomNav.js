"use client";

import React, { useState } from "react";
import { Home, Map, Heart, Instagram } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", icon: Home, path: "/" },
    { id: "map", icon: Map, path: "/map" },
    { id: "instagram", icon: Instagram, path: "https://www.instagram.com/baliheadtour" },
    { id: "favorites", icon: Heart, path: "/favorites" },
  ];

  // Map path to active tab on mount
  React.useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname?.startsWith("/map")) setActiveTab("map");
    else if (pathname?.startsWith("/favorites")) setActiveTab("favorites");
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Hide BottomNav on tour detail pages to prevent overlapping with booking bar
  if (pathname.startsWith("/tours/")) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <div className="bg-[#1C1C1E]/60 backdrop-blur-2xl rounded-[32px] py-4 px-6 flex justify-between items-center w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.id === "instagram") {
            return (
              <a
                key={item.id}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center justify-center w-10 h-10 group"
              >
                <Icon
                  size={22}
                  className="relative z-10 transition-colors duration-300 text-white/70 group-hover:text-white"
                />
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center w-10 h-10"
            >
              {isActive && (
                <div className="absolute inset-0 bg-accent rounded-full shadow-[0_0_15px_rgba(217,251,65,0.4)]"></div>
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-colors duration-300 ${isActive ? "text-primary stroke-[2.5px]" : "text-white/70 hover:text-white"}`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
