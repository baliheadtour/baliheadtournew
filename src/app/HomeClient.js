"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { TreePine, Umbrella, Mountain, Droplets, Search, Plane, Building, Building2, Train, Bus, BriefcaseBusiness, Heart, HeartOff, MapPin, Map, Car, Bike, Wifi, Navigation, Sparkles, Landmark, Camera, Waves, Compass, ChevronDown, ChevronLeft, ChevronRight, Settings2, Star, Zap, Home as HomeIcon, Flower2, Globe, ArrowUpRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { TourIcon, SpaIcon, TransportIcon, ScooterIcon, ThinSparklesIcon, TowelsIcon, LotusIcon, CreattieTourIcon, CreattieSpaIcon, CreattieScooterIcon, CreattieTransportIcon, CreattieEsimIcon, AirbnbTourIcon, AirbnbSpaIcon, AirbnbScooterIcon, AirbnbTransportIcon, AirbnbEsimIcon } from "@/components/icons/CategoryIcons";
import ListingCard from "@/components/listing/ListingCard";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateSlug } from "@/lib/utils";

const InstagramIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const BaliGateIcon = ({ className, isActive }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M5 22V10L9 6L9 22H5Z" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M19 22V10L15 6L15 22H19Z" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M4 14H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 14H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 18H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7" cy="4" r="1" fill="currentColor" />
    <circle cx="17" cy="4" r="1" fill="currentColor" />
  </svg>
);

const services = [
  { id: "Tour", icon: Map },
  { id: "Transport", icon: Bus },
  { id: "Activities", icon: Sparkles },
];

const getCategoriesForService = (service) => {
  if (service === "Tour" || service === "Activities") {
    return [
      { id: "All", icon: Compass },
      { id: "Adventure", icon: Mountain },
      { id: "Water", icon: Waves },
      { id: "Nature", icon: TreePine },
      { id: "Culture", icon: Landmark },
      { id: "Instagram", icon: Camera }
    ];
  } else if (service === "Transport") {
    return [
      { id: "All", icon: Compass },
      { id: "Airport", icon: Plane },
      { id: "Daily", icon: Car }
    ];
  } else if (service === "Esim") {
    return [
      { id: "All", icon: Wifi },
      { id: "Daily", icon: MapPin },
      { id: "Monthly", icon: Map }
    ];
  }
  return [{ id: "All", icon: Compass }];
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}?controls=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
    : null;
};

const campaigns = [
  {
    id: 1,
    title: "Ubud Heritage",
    subtitle: "Experience the lush green beauty of Tegalalang.",
    badge: "Exclusive",
    image: ""
  },
  {
    id: 2,
    title: "Ubud Wellness\nRetreat",
    subtitle: "Complimentary 60-min massage with any villa booking.",
    badge: "Best Deal",
    image: "",
  },
  {
    id: 3,
    title: "Nusa Penida\nIsland Hopper",
    subtitle: "Fast boat & tour package starting at $49.",
    badge: "Limited Time",
    image: "",
  }
];

const popularTrips = [];



export default function HomeClient({ initialListings = [], initialSettings = null, initialBlogs = [] }) {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("All");
  const [activeService, setActiveService] = useState("Tour");
  const [currentCampIdx, setCurrentCampIdx] = useState(0);

  // Custom event listeners to sync with Desktop Navbar.js
  useEffect(() => {
    const handleService = (e) => {
      setActiveService(e.detail);
      setActiveCat("All");
      setSearchQuery("");
    };
    const handleSearch = (e) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener('serviceChanged', handleService);
    window.addEventListener('searchQueryChanged', handleSearch);
    return () => {
      window.removeEventListener('serviceChanged', handleService);
      window.removeEventListener('searchQueryChanged', handleSearch);
    };
  }, []);

  // New States for Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState([0, 5000000]);
  // SWR Fetchers
  const fetcherListings = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('listings')
      .select('id, type, title, location, price, duration, category, rating, reviews, status, image, company_name, originalService:data->originalService, isCampaignPinned:data->isCampaignPinned, campaignTitle:data->campaignTitle, campaignDescription:data->campaignDescription, campaignLabel:data->campaignLabel, campaignVideo:data->campaignVideo, campaignYoutubeLink:data->campaignYoutubeLink, campaignRecommendation:data->campaignRecommendation, campaignIgLink:data->campaignIgLink, isBestTripPinned:data->isBestTripPinned, spaSetting:data->spaSetting, tourTiers:data->tourTiers, allInclusiveTiers:data->allInclusiveTiers, allInclusiveSurcharge:data->allInclusiveSurcharge, pricingType:data->pricingType, min60:data->min60, min90:data->min90, min120:data->min120, dailyPrice:data->dailyPrice, weeklyPrice:data->weeklyPrice, monthlyPrice:data->monthlyPrice, badge:data->badge')
      .eq('status', 'Active');

    if (error) throw error;

    return data.map(d => ({
      ...d,
      service: d.originalService || d.type
    }));
  };

  const fetcherSettings = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('campaign_video, campaign_youtube_link, campaign_recommendation, campaign_ig_link, campaign_recommendation_2, campaign_ig_link_2')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ? {
      campaignVideo: data.campaign_video || "",
      campaignYoutubeLink: data.campaign_youtube_link || "",
      campaignRecommendation: data.campaign_recommendation || "",
      campaignIgLink: data.campaign_ig_link || "",
      campaignRecommendation2: data.campaign_recommendation_2 || "",
      campaignIgLink2: data.campaign_ig_link_2 || ""
    } : null;
  };

  const fetcherBlogs = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, slug, image, category')
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;
    return data;
  };

  const { data: heroSettings = initialSettings, mutate: mutateSettings } = useSWR('homepage_settings', fetcherSettings, {
    fallbackData: initialSettings,
    revalidateOnMount: false,
    keepPreviousData: true,
  });

  const { data: allListings = initialListings } = useSWR('listings', fetcherListings, {
    fallbackData: initialListings,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    keepPreviousData: true,
  });

  const { data: recommendedPlaces = initialBlogs } = useSWR('blogs', fetcherBlogs, {
    fallbackData: initialBlogs,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    keepPreviousData: true,
  });

  const [isDesktop, setIsDesktop] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeMobileLabelIdx, setActiveMobileLabelIdx] = useState(0);
  const [showHeroLabel, setShowHeroLabel] = useState(true);
  const [hasShownMidRollLabel, setHasShownMidRollLabel] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const heroMediaRef = React.useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMobileLabelIdx(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setShowHeroLabel(true);
      return;
    }

    // When playing starts
    setShowHeroLabel(false);

    if (!hasShownMidRollLabel) {
      const showTimer = setTimeout(() => {
        if (isPlaying) {
          setShowHeroLabel(true);
          const hideTimer = setTimeout(() => {
            setShowHeroLabel(false);
            setHasShownMidRollLabel(true);
          }, 5000);
          return () => clearTimeout(hideTimer);
        }
      }, 20000);
      return () => clearTimeout(showTimer);
    }
  }, [isPlaying, hasShownMidRollLabel]);

  
  const toggleMute = (e) => {
    e.stopPropagation();
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (heroMediaRef.current) {
      if (heroMediaRef.current.tagName === 'IFRAME') {
        heroMediaRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: nextMute ? 'mute' : 'unMute',
          args: []
        }), '*');
        if (!nextMute) {
          heroMediaRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [100]
          }), '*');
        }
      } else if (heroMediaRef.current.tagName === 'VIDEO') {
        heroMediaRef.current.muted = nextMute;
      }
    }
  };

  const togglePlayPause = () => {
    setShowVideo(true);
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (heroMediaRef.current) {
      if (heroMediaRef.current.tagName === 'IFRAME') {
        if (nextState) {
          heroMediaRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: []
          }), '*');
        } else {
          heroMediaRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: []
          }), '*');
        }
      } else if (heroMediaRef.current.tagName === 'VIDEO') {
        if (nextState) {
          heroMediaRef.current.muted = false;
          heroMediaRef.current.play();
        } else {
          heroMediaRef.current.pause();
        }
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsPlaying(false); // Mobile always starts paused due to browser autoplay policies
      }
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Signal to SplashScreen that content is ready once SWR data has settled
  useEffect(() => {
    if (allListings && allListings.length > 0 && recommendedPlaces) {
      window.dispatchEvent(new Event("app-content-ready"));
    }
  }, [allListings, recommendedPlaces]);

  // Delay video loading to prioritize LCP image
  useEffect(() => {
    if (isDesktop) {
      setShowVideo(true);
    } else {
      const timer = setTimeout(() => setShowVideo(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [isDesktop]);

  // Track native YouTube play/pause state for Instagram labels
  useEffect(() => {
    if (!showVideo || !heroMediaRef.current || heroMediaRef.current.tagName !== 'IFRAME') return;

    let player;
    const initPlayer = () => {
      try {
        player = new window.YT.Player(heroMediaRef.current, {
          events: {
            'onStateChange': (event) => {
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (e) {
        console.error("YT Player init error", e);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          initPlayer();
        }
      }, 100);
      return () => clearInterval(checkYT);
    } else {
      setTimeout(initPlayer, 500);
    }
  }, [showVideo]);

  useEffect(() => {
    const handler = () => mutateSettings();
    window.addEventListener("homepage_hero_settings_changed", handler);
    return () => window.removeEventListener("homepage_hero_settings_changed", handler);
  }, [mutateSettings]);


  const nextCamp = () => setCurrentCampIdx((prev) => (prev + 1) % campaigns.length);
  const prevCamp = () => setCurrentCampIdx((prev) => (prev - 1 + campaigns.length) % campaigns.length);

  const currentCategories = getCategoriesForService(activeService);

  const isValidService = (t) => t.service === activeService || (activeService === "Tour" && t.service === "Activities");

  let filteredTours = activeCat === "All"
    ? allListings.filter(isValidService)
    : allListings.filter(t => isValidService(t) && (
      t.category === activeCat ||
      t.spaSetting === activeCat ||
      (activeCat === "Day Spa" && t.spaSetting === "Real Spa")
    ));

  // Apply Text Search Filter
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    filteredTours = filteredTours.filter(t =>
      t.title.toLowerCase().includes(lowerQ) || t.location.toLowerCase().includes(lowerQ)
    );
  }

  // Apply Price Filter
  filteredTours = filteredTours.filter(t => t.price >= priceFilter[0] && t.price <= priceFilter[1]);

  const pinnedCampaigns = allListings.filter(t => t.isCampaignPinned).map((t, idx) => ({
    id: t.id || idx,
    title: t.campaignTitle || t.title,
    subtitle: t.campaignDescription, // Description
    location: t.location, // Explicitly pass location
    badge: t.campaignLabel !== undefined ? t.campaignLabel : "Featured Deal",
    image: t.image || "",
    targetId: t.id,
    originalTitle: t.title,
    campaignVideo: t.campaignVideo,
    campaignYoutubeLink: t.campaignYoutubeLink,
    campaignRecommendation: t.campaignRecommendation,
    campaignIgLink: t.campaignIgLink
  }));

  const defaultHero = {
    id: 'hero-fallback',
    isHeroSlide: true,
    campaignYoutubeLink: "https://www.youtube.com/watch?v=uN1A72bE0l4",
    campaignRecommendation: "Highly Recommended by Zondela",
    campaignIgLink: "https://instagram.com/zondela",
    image: ""
  };

  const actualHero = heroSettings ? {
    ...defaultHero,
    id: 'hero-custom',
    campaignVideo: heroSettings.campaignVideo || "",
    campaignYoutubeLink: heroSettings.campaignYoutubeLink || "",
    campaignRecommendation: heroSettings.campaignRecommendation || "",
    campaignIgLink: heroSettings.campaignIgLink || "",
    campaignRecommendation2: heroSettings.campaignRecommendation2 || "",
    campaignIgLink2: heroSettings.campaignIgLink2 || "",
  } : defaultHero;

  const tourCampaigns = pinnedCampaigns.length > 0 ? pinnedCampaigns : campaigns;
  const displayCampaigns = [actualHero, ...tourCampaigns];

  const bestTrips = allListings.filter(t => t.isBestTripPinned && t.service === activeService);
  const displayPopularTrips = bestTrips.length > 0 ? bestTrips : popularTrips;

  // Suggestions for smart keyboard integration
  const availableSuggestions = Array.from(new Set(
    allListings.filter(t => t.service === activeService).flatMap(t => [t.title, t.location])
  ));

  const searchSuggestions = availableSuggestions
    .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const getPopularTripsTitle = () => {
    if (activeService === "Tour") return "Featured Tours";
    if (activeService === "Transport") return "Premium Fleet";
    return `Top Picks for ${activeService}`;
  };

  return (
    <div className="w-full bg-background min-h-[100dvh] font-sans pb-32">

      <div className="w-full pt-[28px] md:pt-[100px] pb-4">
        {/* Mobile Top Header Search (Hidden on Desktop) */}
        <div className="md:hidden relative z-40 px-5">

          {/* Location Filter (Animated Segmented Control Style) */}
          <div className="bg-[#cce823] rounded-[32px] p-1.5 shadow-[0_4px_20px_rgba(204,232,35,0.3)] mb-4">
            <div className="flex items-center overflow-x-auto no-scrollbar hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {["All Bali", "Ubud", "Canggu", "Seminyak", "Nusa Penida", "Uluwatu"].map((loc) => {
                const isActive = (searchQuery.toLowerCase() === loc.toLowerCase()) || (searchQuery === "" && loc === "All Bali");
                return (
                  <button
                    key={loc}
                    onClick={() => setSearchQuery(loc === "All Bali" ? "" : loc)}
                    className="relative flex items-center justify-center px-5 py-2.5 rounded-[24px] active:scale-95 outline-none shrink-0"
                  >
                    {/* Animated Sliding White Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="locationActiveIndicator"
                        className="absolute inset-0 bg-white rounded-[24px] shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                    )}

                    {/* Text Label or Icon */}
                    <div className="relative z-10 flex items-center justify-center">
                      {loc === "All Bali" ? (
                        <BaliGateIcon isActive={isActive} className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-[#1C1C1E]' : 'text-[#1C1C1E]/60 hover:text-[#1C1C1E]'}`} />
                      ) : (
                        <span className={`text-[14px] tracking-tight whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#1C1C1E] font-extrabold' : 'text-[#1C1C1E]/70 font-bold hover:text-[#1C1C1E]'}`}>
                          {loc}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center bg-white border border-border shadow-soft rounded-full pl-2 pr-2 py-2 relative mb-6">

            {/* Mobile Service Dropdown Trigger inside Search Bar */}
            <button
              onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-50 text-primary active:scale-95 transition-all outline-none"
            >
              <span className="font-extrabold text-[14px] tracking-tight">{activeService}</span>
              <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="h-5 w-[1px] bg-border/80 mx-1 shrink-0"></div>

            <Search size={18} className="text-text-secondary shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder={`Search...`}
              className="flex-1 min-w-0 outline-none text-[15px] font-medium bg-transparent text-primary placeholder:text-text-secondary pr-2"
            />

            {/* Filter Modal Toggle */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 bg-accent text-primary hover:scale-105`}
            >
              <Settings2 size={16} strokeWidth={2.5} />
            </button>

            {/* Mobile Service Dropdown */}
            {isServiceDropdownOpen && (
              <div className="absolute top-[60px] left-0 bg-white rounded-2xl p-2 shadow-2xl flex flex-col min-w-[160px] border border-border animate-in fade-in zoom-in-95 duration-200 z-[70]">
                {services.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (s.id === "Transport" || s.id === "Car Rental") {
                          router.push(`/map?service=${s.id === "Car Rental" ? "CarRental" : "Transport"}`);
                          return;
                        }
                        setActiveService(s.id);
                        setIsServiceDropdownOpen(false);
                        setActiveCat("All");
                        setSearchQuery("");

                        if (s.id === "Scooter") {
                          setTimeout(() => {
                            const el = document.getElementById("categories-section");
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeService === s.id ? 'bg-primary text-accent' : 'bg-transparent text-text-secondary hover:bg-gray-50 hover:text-primary'} outline-none`}
                    >
                      {Icon && <Icon size={16} className={activeService === s.id ? 'text-accent' : 'text-text-secondary'} strokeWidth={2} />}
                      {s.id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute top-[100%] mt-2 left-6 right-6 bg-white rounded-2xl p-2 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 z-[60]">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchQuery(loc); setIsSearchFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    {allListings.some(t => t.location === loc) ? <MapPin size={16} className="text-secondary" /> : <Search size={16} className="text-secondary" />}
                    <span className="font-bold text-[14px] text-primary truncate block flex-1">{loc}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-text-secondary font-medium text-center">
                  No places found
                </div>
              )}
            </div>
          )}
        </div>
        {/* Apple-style Filter Bottom Sheet */}
        <AnimatePresence>
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsFilterModalOpen(false)}
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className="bg-white w-full rounded-t-[32px] p-6 relative flex flex-col pointer-events-auto h-fit pb-12"
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[22px] font-extrabold text-primary tracking-tight">Filters</h3>
                  <button onClick={() => setPriceFilter([0, 5000000])} className="text-secondary font-bold text-[15px] active:scale-95 transition-transform">Reset</button>
                </div>

                {/* Price Filter Options */}
                <div className="mb-8">
                  <h4 className="text-[17px] font-extrabold text-primary mb-4">Price Range</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Any price", min: 0, max: 5000000 },
                      { label: "Under Rp 500k", min: 0, max: 500000 },
                      { label: "Rp 500k - Rp 1M", min: 500000, max: 1000000 },
                      { label: "Over Rp 1M+", min: 1000000, max: 5000000 },
                    ].map((opt, i) => {
                      const isSelected = priceFilter[0] === opt.min && priceFilter[1] === opt.max;
                      return (
                        <label key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all w-full cursor-pointer touch-manipulation active:scale-[0.98] ${isSelected ? 'border-primary bg-primary text-white shadow-md' : 'border-border bg-white text-primary hover:border-gray-300'}`}>
                          <span className="font-bold text-[15px]">{opt.label}</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'border-none bg-accent' : 'border border-gray-300'}`}>
                            {isSelected && <MapPin size={12} className="text-primary" strokeWidth={3} />}
                          </div>
                          <input type="radio" className="hidden" name="price" checked={isSelected} onChange={() => setPriceFilter([opt.min, opt.max])} />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full bg-accent text-primary font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 mb-2"
                >
                  Show {filteredTours.length} Results
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile-only Campaign Swipe Carousel */}
        <section className="md:hidden pt-4 pb-6 relative z-10">
          <div
            className="flex overflow-x-auto no-scrollbar gap-4 px-6 snap-x snap-mandatory"
            onScroll={(e) => {
              const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
              if (index !== currentCampIdx) setCurrentCampIdx(index);
            }}
          >
            {displayCampaigns.map((camp, idx) => (
              <div key={camp.id} className="relative w-full shrink-0 snap-center aspect-[4/3] rounded-[28px] overflow-hidden shadow-soft border border-border bg-black select-none">
                {camp.campaignYoutubeLink && idx === 0 && !isDesktop ? (
                  showVideo ? (
                    <iframe loading="lazy" ref={camp.isHeroSlide ? heroMediaRef : null} src={getYoutubeEmbedUrl(camp.campaignYoutubeLink)} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen />
                  ) : camp.image ? (
                    <Image src={camp.image} alt={camp.badge || "Campaign Image"} priority={idx === 0} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  ) : null
                ) : camp.campaignVideo && idx === 0 && !isDesktop ? (
                  showVideo ? (
                    <video ref={camp.isHeroSlide ? heroMediaRef : null} src={camp.campaignVideo} autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                  ) : camp.image ? (
                    <Image src={camp.image} alt={camp.badge || "Campaign Image"} priority={idx === 0} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  ) : null
                ) : camp.image ? (
                  <Image src={camp.image} alt={camp.badge || "Campaign Image"} priority={idx === 0} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/40 to-transparent z-0 pointer-events-none" />

                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {!camp.isHeroSlide && camp.badge && (
                    <span className="inline-block px-3 py-1.5 w-max bg-accent text-primary text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-sm rounded-[8px]">{camp.badge}</span>
                  )}
                </div>

                {/* Mobile Hero Recommendation Labels (Top and Bottom) */}
                {camp.isHeroSlide && (
                  <>
                    <AnimatePresence>
                      {showHeroLabel && camp.campaignRecommendation && (
                        <motion.div
                          initial={{ opacity: 0, y: -15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] flex justify-center z-20 pointer-events-none"
                        >
                          <a
                            href={camp.campaignIgLink || "#"}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#cce823] text-[#1C1C1E] px-4 py-2 rounded-md shadow-[0_8px_30px_rgba(204,232,35,0.3)] hover:scale-105 transition-transform pointer-events-auto max-w-full"
                          >
                            <InstagramIcon size={14} className="text-[#1C1C1E] shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center whitespace-normal leading-tight line-clamp-2">{camp.campaignRecommendation}</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showHeroLabel && camp.campaignRecommendation2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] flex justify-center z-20 pointer-events-none"
                        >
                          <a
                            href={camp.campaignIgLink2 || "#"}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#1C1C1E]/95 backdrop-blur-md border-l-4 border-[#cce823] text-[#cce823] px-4 py-2 rounded-md shadow-2xl hover:scale-105 transition-transform pointer-events-auto max-w-full"
                          >
                            <InstagramIcon size={14} className="text-[#cce823] shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center whitespace-normal leading-tight line-clamp-2">{camp.campaignRecommendation2}</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}


                {camp.isHeroSlide && (camp.campaignVideo && !camp.campaignYoutubeLink) && (
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-[8%] right-[4%] z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all pointer-events-auto active:scale-95 shadow-xl"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                )}
                {/* Mobile Center Play/Pause */}

                {camp.isHeroSlide && (camp.campaignVideo && !camp.campaignYoutubeLink) && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <button
                      onClick={togglePlayPause}
                      className={`w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all pointer-events-auto active:scale-95 shadow-2xl ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                    >
                      {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                    </button>
                  </div>
                )}

                {/* Text and button positioned perfectly inside bounds */}
                {!camp.isHeroSlide && (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col justify-end items-start pointer-events-none">
                    <h3 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-[1.05] mb-2 font-sans tracking-tight whitespace-pre-line drop-shadow-lg">{camp.title}</h3>
                    <p className="text-white/90 text-[13px] sm:text-[15px] font-medium mb-4 leading-snug drop-shadow-md">{camp.subtitle}</p>

                    <Link href={camp.targetId ? `/tours/${generateSlug(camp.originalTitle || camp.title)}` : "#"} className="bg-white text-primary px-6 py-3 rounded-full font-bold text-[14px] shadow-xl active:scale-95 transition-transform flex items-center justify-center pointer-events-auto">
                      View Detail
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-5 gap-2 items-center">
            {campaigns.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentCampIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 pointer-events-none ${idx === currentCampIdx ? 'w-5 bg-accent' : 'w-1.5 bg-border'}`}
              />
            ))}
          </div>
        </section>

        {/* Desktop/iPad Full-Screen Cinematic Hero */}
        <section className="hidden md:block absolute top-0 left-0 w-full h-[100vh] min-h-[700px] overflow-hidden bg-black group">
          {displayCampaigns.map((camp, idx) => (
            <div
              key={camp.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentCampIdx ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
            >
              {camp.campaignYoutubeLink && idx === 0 && isDesktop ? (
                showVideo ? (
                  <iframe loading="lazy" ref={camp.isHeroSlide ? heroMediaRef : null} src={getYoutubeEmbedUrl(camp.campaignYoutubeLink)} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen />
                ) : camp.image ? (
                  <Image src={camp.image} alt={camp.badge || "Hero Image"} priority={idx === 0} fill sizes="100vw" className={`object-cover transition-transform duration-[20s] ease-linear ${idx === currentCampIdx ? 'scale-110' : 'scale-100'}`} />
                ) : null
              ) : camp.campaignVideo && idx === 0 && isDesktop ? (
                showVideo ? (
                  <video ref={camp.isHeroSlide ? heroMediaRef : null} src={camp.campaignVideo} autoPlay loop playsInline className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear ${idx === currentCampIdx ? 'scale-110' : 'scale-100'} pointer-events-none`} />
                ) : camp.image ? (
                  <Image src={camp.image} alt={camp.badge || "Hero Image"} priority={idx === 0} fill sizes="100vw" className={`object-cover transition-transform duration-[20s] ease-linear ${idx === currentCampIdx ? 'scale-110' : 'scale-100'}`} />
                ) : null
              ) : camp.image ? (
                <Image src={camp.image} alt={camp.badge || "Hero Image"} priority={idx === 0} fill sizes="100vw" className={`object-cover transition-transform duration-[20s] ease-linear ${idx === currentCampIdx ? 'scale-110' : 'scale-100'}`} />
              ) : null}

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
              {!camp.isHeroSlide && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent z-0 pointer-events-none" />
                </>
              )}

              {/* Left Recommendation Label (Under Text) */}
              {camp.isHeroSlide && camp.campaignRecommendation && (
                <div className="absolute bottom-[18%] left-[4%] z-20 pointer-events-none">
                  <a href={camp.campaignIgLink || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#cce823] text-[#1C1C1E] px-6 py-3 rounded-md shadow-[0_8px_30px_rgba(204,232,35,0.3)] hover:scale-105 transition-transform duration-300 pointer-events-auto max-w-max">
                    <InstagramIcon size={18} className="text-[#1C1C1E] shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-[12px] xl:text-[14px] font-black uppercase tracking-widest drop-shadow-sm whitespace-nowrap">{camp.campaignRecommendation}</span>
                  </a>
                </div>
              )}

              {/* Right Recommendation Label (Above Numbers) */}
              {camp.isHeroSlide && camp.campaignRecommendation2 && (
                <div className="absolute bottom-[18%] right-[4%] z-20 pointer-events-none">
                  <a href={camp.campaignIgLink2 || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#1C1C1E]/95 backdrop-blur-md border-l-4 border-[#cce823] text-[#cce823] px-6 py-3 rounded-md shadow-2xl hover:scale-105 transition-transform duration-300 pointer-events-auto max-w-max">
                    <InstagramIcon size={18} className="text-[#cce823] shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-[12px] xl:text-[14px] font-black uppercase tracking-widest drop-shadow-sm whitespace-nowrap">{camp.campaignRecommendation2}</span>
                  </a>
                </div>
              )}


              {camp.isHeroSlide && (camp.campaignVideo && !camp.campaignYoutubeLink) && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-[6%] right-[16%] z-40 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all pointer-events-auto active:scale-95 shadow-xl"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              )}
              {/* Desktop Center Play/Pause Toggle */}

              {camp.isHeroSlide && (camp.campaignVideo && !camp.campaignYoutubeLink) && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <button
                    onClick={togglePlayPause}
                    className={`w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all pointer-events-auto active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 ${!isPlaying ? '!opacity-100' : ''}`}
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
                  </button>
                </div>
              )}

              {/* Left Typography */}
              {!camp.isHeroSlide && (
                <div className="absolute bottom-[22%] left-[6%] xl:left-[8%] z-10 w-full max-w-[800px] flex flex-col items-start">
                  <h2
                    className={`font-black uppercase tracking-tighter text-white mb-4 drop-shadow-2xl whitespace-pre-line ${camp.title?.length > 20 ? 'text-[50px] lg:text-[70px] xl:text-[90px] leading-[0.9]' :
                        camp.title?.length > 12 ? 'text-[60px] lg:text-[90px] xl:text-[120px] leading-[0.85]' :
                          'text-[80px] lg:text-[110px] xl:text-[140px] leading-[0.85]'
                      }`}
                  >
                    {camp.title}
                  </h2>

                  <span className="block text-white/90 font-bold text-[14px] lg:text-[16px] tracking-[0.3em] uppercase mb-8 drop-shadow-md mt-2">
                    {camp.location || "BALI, INDONESIA"}
                  </span>

                  <Link href={camp.targetId ? `/tours/${generateSlug(camp.originalTitle || camp.title)}` : "#"} className="inline-flex items-center gap-3 px-8 py-4 rounded-[32px] border border-white/30 bg-black/40 backdrop-blur-md text-white font-bold text-[13px] tracking-[0.1em] uppercase hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl">
                    Explore Experience <ArrowUpRight size={18} strokeWidth={2.5} />
                  </Link>
                </div>
              )}

              {/* Right Typography */}
              {!camp.isHeroSlide && (
                <div className="absolute bottom-[22%] right-[6%] xl:right-[8%] z-10 w-full max-w-[400px] flex flex-col items-end text-right">
                  {camp.badge && (
                    <span className="inline-block mb-4 px-3 py-1.5 bg-accent text-primary text-[11px] font-extrabold uppercase tracking-widest shadow-sm rounded-[8px]">
                      {camp.badge}
                    </span>
                  )}
                  {camp.subtitle && (
                    <p className="text-white/90 text-[16px] lg:text-[18px] font-medium leading-snug drop-shadow-md">
                      {camp.subtitle}
                    </p>
                  )}
                </div>
              )}

            </div>
          ))}



          {/* Bottom Controls */}
          <div className="absolute bottom-[8%] left-[6%] xl:left-[8%] z-20 flex items-center gap-6 xl:gap-8">
            <div className="flex gap-3">
              <button onClick={prevCamp} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 hover:bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95">
                <ChevronLeft size={20} strokeWidth={2.5} className="mr-0.5" />
              </button>
              <button onClick={nextCamp} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 hover:bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95">
                <ChevronRight size={20} strokeWidth={2.5} className="ml-0.5" />
              </button>
            </div>

            <div className="w-[150px] xl:w-[250px] h-[2px] bg-white/20 relative rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${((currentCampIdx + 1) / displayCampaigns.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Fractional Indicator */}
          <div className="absolute bottom-[6%] right-[4%] z-20 text-white flex items-baseline gap-1 shadow-black drop-shadow-2xl">
            <span className="font-black text-[46px] leading-none tracking-tighter">{(currentCampIdx + 1).toString().padStart(2, '0')}</span>
            <span className="font-bold text-[18px] opacity-60">/ {displayCampaigns.length.toString().padStart(2, '0')}</span>
          </div>
        </section>

        {/* Invisible spacer to push content down below the absolute hero */}
        <div className="hidden md:block w-full h-[100vh]" />
      </div>

      <div className="max-w-[1400px] mx-auto min-h-screen">

        {/* Popular Trips */}
        <section className="pt-2 mb-8 relative">
          <div className="px-6 flex justify-between items-end mb-4">
            <h2 className="text-[20px] font-bold text-primary flex items-center gap-2">
              {getPopularTripsTitle()}
            </h2>
            <Link
              href={activeService === "Tour" ? "/tours" : activeService === "Transport" ? "/map" : "/esim"}
              className="text-sm font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            >
              See more
            </Link>
          </div>

          {/* Horizontal Scroll Area */}
          <div className="flex overflow-x-auto no-scrollbar gap-5 px-6 pb-6 snap-x snap-mandatory hide-scroll">
            {displayPopularTrips.length > 0 ? displayPopularTrips.map((trip) => (
              <Link href={`/tours/${generateSlug(trip.title)}`} key={trip.id} className="block relative w-[240px] md:w-[280px] aspect-[4/5] rounded-[28px] overflow-hidden shadow-soft shrink-0 snap-start group border border-border bg-white">
                <Image src={trip.image} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-[8s] ease-out group-hover:scale-110" alt={trip.title || "Trip Image"} />

                {/* Heart Button */}
                <button className="absolute top-4 right-4 w-[34px] h-[34px] bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 shadow-xl z-10 transition-transform active:scale-95 hover:text-red-500 hover:scale-110">
                  <Heart size={16} strokeWidth={2.5} />
                </button>

                {/* Bottom Overlay Card */}
                <div className="absolute left-3 right-3 bottom-3 bg-white/95 backdrop-blur-md px-4 py-3.5 rounded-2xl flex flex-col gap-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                  <h3 className="font-extrabold text-[15px] leading-snug text-primary line-clamp-2">{trip.title}</h3>
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star size={12} strokeWidth={2.5} className="fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-[12px] font-bold text-primary">5.0</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-extrabold text-[15px] text-primary tracking-tight pr-1">
                        IDR {Number(trip.price > 1000 ? trip.price : trip.price * 1000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="w-full text-center py-6 text-gray-400 font-medium text-sm">
                No items pinned as Best Trips for this category.
              </div>
            )}
          </div>
        </section>


        {/* Categories */}
        <section id="categories-section" className="px-6 mb-8 mt-2">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[20px] font-bold text-primary">Categories</h2>
            <Link href={activeService === "Tour" ? "/tours" : activeService === "Transport" ? "/map" : "/esim"} className="text-sm font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors">See more</Link>
          </div>
          <div className="flex justify-center w-full overflow-hidden">
            <div className="bg-[#cce823] rounded-[32px] p-1.5 shadow-[0_4px_20px_rgba(204,232,35,0.3)] w-fit max-w-full mx-auto">
              <div className="flex items-center overflow-x-auto no-scrollbar hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {currentCategories.map((c) => {
                  const Icon = c.icon;
                  const isActive = activeCat === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCat(c.id)}
                      className="relative flex items-center justify-center px-4 py-2 rounded-[24px] active:scale-95 outline-none shrink-0"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="categoryActiveIndicator"
                          className="absolute inset-0 bg-white rounded-[24px] shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-center gap-1.5">
                        {Icon && <Icon size={16} className={`transition-colors duration-300 ${isActive ? 'text-[#1C1C1E]' : 'text-[#1C1C1E]/60 hover:text-[#1C1C1E]'}`} strokeWidth={2} />}
                        <span className={`text-[13px] tracking-tight whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#1C1C1E] font-extrabold' : 'text-[#1C1C1E]/70 font-bold hover:text-[#1C1C1E]'}`}>
                          {c.id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Filtered Experiences */}
        <section className="mt-6 mb-12">
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-5 px-6 pb-8 md:grid md:grid-cols-3 md:px-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filteredTours.length > 0 ? (
              filteredTours.map(tour => (
                <div key={tour.id} className="flex-none w-[85vw] sm:w-[300px] snap-center md:w-auto md:snap-align-none animate-in fade-in zoom-in duration-300">
                  <ListingCard item={tour} linkTo={`/tours/${generateSlug(tour.title)}`} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 px-6 text-text-secondary font-medium">
                No tours found for this category currently.
              </div>
            )}
          </div>
        </section>

        {/* Recommended Places */}
        <section className="px-6 mb-20">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-[20px] font-bold text-primary">Recommended Places</h2>
            <span className="text-sm font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors">See more</span>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 snap-x snap-mandatory">
            {recommendedPlaces.map((place, index) => (
              <a href={place.slug ? (place.slug.startsWith('http') ? place.slug : `https://www.bobbybaliguide.com${place.slug.startsWith('/') ? place.slug : '/' + place.slug}`) : "#"} key={place.id} className={`block relative rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] group cursor-pointer border border-border shrink-0 snap-center ${index === 0 ? 'w-[85vw] md:w-auto md:col-span-2 aspect-[4/3] md:aspect-[2/1]' : 'w-[200px] md:w-auto aspect-[3/4] md:aspect-square'}`}>
                {place.image && <Image src={place.image} alt={place.title || "Place Image"} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-widest shadow-sm rounded-xl">{place.category || 'Featured'}</span>
                </div>

                {/* Bottom Content Frosted Glass Pane */}
                <div className="absolute bottom-3 inset-x-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col z-20 transition-all duration-300 group-hover:bg-white/20">
                  <h3 className={`font-black text-white leading-tight ${index === 0 ? 'text-[18px] md:text-[22px]' : 'text-[14px] line-clamp-2'}`}>{place.title}</h3>
                  <div className="flex items-center gap-1.5 mt-2 opacity-90 text-white">
                    <MapPin size={12} className="shrink-0" />
                    <span className="text-[11px] font-bold tracking-wide uppercase truncate">{place.location}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
