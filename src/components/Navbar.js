"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, MapPin, Globe, Menu, Bell, Settings2, ChevronDown, User, Map, Bus, Sparkles, Car } from "lucide-react";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeService, setActiveService] = useState("Tour");
  
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [isTranslating, setIsTranslating] = useState(false);
  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'French' },
    { code: 'ES', name: 'Spanish' },
    { code: 'ID', name: 'Indonesia' }
  ];

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      setActiveLang(match[1].toUpperCase());
    }
  }, []);

  const handleLanguageChange = (langCode) => {
    setActiveLang(langCode);
    setLangDropdownOpen(false);
    setIsTranslating(true);
    
    const code = langCode.toLowerCase();
    
    // Set google translate cookies with and without domain for broader compatibility
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=.${window.location.hostname}`;
    document.cookie = `googtrans=/en/${code}; path=/`;

    // Wait a brief moment to ensure cookie is set
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        setIsTranslating(false);
      } else {
        // Fallback: If combo box is not injected yet, reload the page so the script reads the newly set cookie
        window.location.reload();
      }
    }, 150);
  };
  
  const services = [
    { id: "Tour", icon: Map },
    { id: "Transport", icon: Bus },
    { id: "Activities", icon: Sparkles },
  ];

  // Hide the global Navbar on individual tour detail pages or the map page
  if (pathname.match(/^\/tours\/.+/) || pathname === '/map') return null;

  return (
    <header className={`fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] left-1/2 -translate-x-1/2 w-full ${isScrolled ? "top-0 bg-white md:bg-white/90 md:backdrop-blur-md shadow-sm border-b border-border md:top-4 md:w-[85%] md:max-w-[1000px] md:rounded-full md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:border md:border-gray-100 md:py-2.5" : "top-0 bg-white md:bg-transparent md:border-b-0 md:w-[95%] md:max-w-[1400px] md:py-5 pt-4 pb-4"}`}>
      
      {/* MOBILE LAYOUT (Inspired by the Reference Image) */}
      <div className="md:hidden px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session ? (
            <div className="w-11 h-11 bg-gray-200 rounded-full overflow-hidden border border-border cursor-pointer shadow-sm" onClick={() => router.push('/profile')}>
              <img src={session.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-11 h-11 bg-accent rounded-full flex justify-center items-center cursor-pointer hover:brightness-95 transition-colors shadow-sm" onClick={() => signIn('google')}>
               <User size={20} className="text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            {session ? (
              <>
                <span className="text-xs text-text-secondary font-medium">Hey, <span className="text-text-primary font-bold">{session.user.name?.split(' ')[0]} 👋</span></span>
                <div className="flex items-center gap-1 text-[10px] text-text-secondary mt-0.5">
                  <span className="text-[#25D366] font-bold">Verified</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-[13px] font-extrabold text-primary cursor-pointer hover:opacity-70 transition-opacity" onClick={() => signIn('google')}>Log In</span>
                <span className="text-[10px] text-text-secondary mt-0.5 font-medium">Sign in to save bookings</span>
              </>
            )}
          </div>
        </div>
        <div className="relative z-50">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="px-3 h-10 bg-accent rounded-full flex items-center gap-1.5 justify-center hover:brightness-95 shadow-soft transition-colors text-primary font-extrabold text-[13px]"
          >
            <Globe size={16} className={`text-primary ${isTranslating ? 'animate-spin' : ''}`} /> {activeLang}
          </button>
          {langDropdownOpen && (
            <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col min-w-[140px] border border-border animate-in fade-in zoom-in-95 duration-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeLang === lang.code ? 'bg-primary text-accent' : 'bg-transparent text-text-secondary hover:bg-gray-50 hover:text-primary'} outline-none`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT (Clean adaptation of the new design system) */}
      <div className="hidden md:flex container mx-auto px-6 w-full items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className={`font-black tracking-[0.1em] flex-1 flex items-center text-xl md:text-[22px] transition-colors duration-500 ${isScrolled ? 'text-[#1C1C1E]' : 'text-white'}`}>
          mybalidriver
        </Link>

        {/* Center Compressed Search */}
        <div className="flex-1 justify-center flex relative z-[60]">
          <div className="flex items-center bg-white border border-border shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full pl-2 pr-2 py-1.5 cursor-pointer transition-all w-full max-w-[420px] relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-50 text-primary active:scale-95 transition-all outline-none"
            >
              <span className="font-extrabold text-[13px] tracking-tight">{activeService}</span>
              <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="h-5 w-[1px] bg-border/80 mx-1 shrink-0"></div>
            <Search size={16} className="text-text-secondary mx-2" />
            <input 
              type="text" 
              placeholder={`Search ${activeService.toLowerCase()}s...`}
              onChange={(e) => window.dispatchEvent(new CustomEvent('searchQueryChanged', { detail: e.target.value }))}
              className="flex-1 outline-none text-[13px] font-medium bg-transparent text-primary placeholder:text-text-secondary min-w-0" 
            />
            <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center ml-2 shadow-sm transition-transform hover:scale-105 shrink-0">
              <Settings2 size={15} strokeWidth={2.5} />
            </div>
            
            {/* Desktop Navbar Dropdown */}
            {filterOpen && (
              <div className="absolute top-[50px] left-0 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col min-w-[160px] border border-border animate-in fade-in zoom-in-95 duration-200">
                {services.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => { 
                        setActiveService(s.id); 
                        setFilterOpen(false); 
                        
                        // Dispatch to page.js
                        window.dispatchEvent(new CustomEvent('serviceChanged', { detail: s.id }));
                        
                        if (s.id === "Transport") {
                          router.push("/map?service=Transport");
                          return;
                        }
                        
                        if (s.id === "Scooter") {
                           setTimeout(() => {
                               const el = document.getElementById("categories-section");
                               if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }, 50);
                        }
                      }} 
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeService === s.id ? 'bg-primary text-accent' : 'bg-transparent text-text-secondary hover:bg-gray-50 hover:text-primary'} outline-none`}
                    >
                      <Icon size={16} className={activeService === s.id ? 'text-accent' : 'text-text-secondary'} strokeWidth={2} />
                      {s.id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex-1 items-center justify-end gap-3 flex">
          <Link href="/about" className={`text-[13px] font-bold px-5 py-2.5 rounded-full transition-colors duration-500 ${isScrolled ? 'text-primary hover:bg-black/5' : 'text-white hover:bg-white/20'}`}>
            Become a Partner
          </Link>
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`px-3 h-9 border rounded-full flex items-center gap-1.5 justify-center transition-all duration-500 shadow-soft font-extrabold text-[12px] ${isScrolled ? 'border-border bg-white hover:bg-gray-50 text-primary' : 'border-white/30 bg-black/20 backdrop-blur-md hover:bg-white/20 text-white'}`}
            >
              <Globe size={14} className={`transition-colors duration-500 ${isScrolled ? 'text-primary' : 'text-white'} ${isTranslating ? 'animate-spin' : ''}`} /> {activeLang}
            </button>
            {langDropdownOpen && (
              <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col min-w-[140px] border border-border animate-in fade-in zoom-in-95 duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeLang === lang.code ? 'bg-primary text-accent' : 'bg-transparent text-text-secondary hover:bg-gray-50 hover:text-primary'} outline-none`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {session ? (
            <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-border cursor-pointer hover:border-black transition-colors shadow-soft" onClick={() => router.push('/profile')}>
              <img src={session.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button onClick={() => signIn('google')} className={`w-9 h-9 border rounded-full flex items-center justify-center transition-all duration-500 shadow-soft ${isScrolled ? 'bg-dark-surface border-transparent text-white hover:scale-105 active:scale-95' : 'bg-black/20 backdrop-blur-md border-white/30 text-white hover:bg-white/20'}`}>
              <User size={16} />
            </button>
          )}
        </div>
      </div>
      
    </header>
  );
}
