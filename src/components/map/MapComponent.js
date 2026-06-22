"use client";

import React, { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Search, MapPin, Navigation, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils";

// Formatter for IDR
const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// Local cache to avoid repeated geocoding of the same regions
const LOCATION_CACHE = {
  'nusa penida': { lat: -8.739184, lng: 115.53112 },
  'mount batur': { lat: -8.239045, lng: 115.377685 },
  'kintamani': { lat: -8.239045, lng: 115.377685 },
  'ubud': { lat: -8.51909, lng: 115.26325 },
  'uluwatu': { lat: -8.8267, lng: 115.0938 },
  'canggu': { lat: -8.6478, lng: 115.1385 },
  'seminyak': { lat: -8.6913, lng: 115.1682 },
  'kuta': { lat: -8.7233, lng: 115.1686 },
  'sanur': { lat: -8.6793, lng: 115.2630 },
  'nusa dua': { lat: -8.8061, lng: 115.2268 },
  'bedugul': { lat: -8.2833, lng: 115.1667 },
  'lovina': { lat: -8.1611, lng: 115.0256 },
  'amed': { lat: -8.3364, lng: 115.6514 },
  'ulun danu': { lat: -8.2833, lng: 115.1667 } // Mapped to Bedugul per user request
};

const CATEGORIES = ["Tour", "Transport", "Activities"];

// Inner component for routing logic
function DirectionsEngine({ routeInfo, setRouteStats }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    setDirectionsService(new routesLib.DirectionsService());
    setDirectionsRenderer(new routesLib.DirectionsRenderer({ 
      map,
      suppressMarkers: false,
      polylineOptions: { strokeColor: "#1E1E24", strokeWeight: 4 }
    }));
  }, [routesLib, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !routeInfo) return;

    directionsService.route(
      {
        origin: routeInfo.origin,
        destination: routeInfo.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK" && response) {
          directionsRenderer.setDirections(response);
          
          const leg = response.routes[0].legs[0];
          const distKm = typeof leg.distance?.value === "number" ? leg.distance.value / 1000 : 0;
          
          setRouteStats({
            distKm,
            distanceText: leg.distance?.text || "",
            durationText: leg.duration?.text || ""
          });
        } else {
          console.error("Directions request failed due to " + status);
          setRouteStats(null);
        }
      }
    );
    
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    }
  }, [routeInfo, directionsService, directionsRenderer]);

  return null;
}

// Inner component for Google Autocomplete Inputs
function PlaceAutocompleteInput({ placeholder, onPlaceSelect, value, onChange, icon: Icon }) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const options = { fields: ["geometry", "name", "formatted_address"], componentRestrictions: { country: "id" } };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    const listener = placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();
      // Prioritize name (like 'Alaya Resort Ubud') over full address.
      onPlaceSelect(place.name || place.formatted_address || "");
    });
    return () => {
      if (listener && window.google) window.google.maps.event.removeListener(listener);
    }
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="flex gap-3 items-center bg-[#F4F4F6] px-4 py-3 rounded-xl border border-border/50">
      {Icon ? <Icon size={14} className="text-secondary stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full bg-accent relative after:absolute after:w-0.5 after:h-5 after:bg-border after:top-2.5 after:left-1"></div>}
      <input 
        ref={inputRef}
        type="text" 
        placeholder={placeholder} 
        className="flex-1 outline-none font-semibold text-[14px] bg-transparent text-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Sub-component wrapper that has child access to APIProvider's hooks
function MapInterface() {
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const [transportsData, setTransportsData] = useState([]);
  const [dbTours, setDbTours] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [dynamicDestinations, setDynamicDestinations] = useState([]);
  
  const geocodingLib = useMapsLibrary("geocoding");
  
  // States migrated from MapPage
  const [activeMode, setActiveMode] = useState("Tour");
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const serviceParam = searchParams.get("service");
    if (serviceParam && CATEGORIES.includes(serviceParam)) {
      setActiveMode(serviceParam);
    }

    const fetchListings = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        
        // Fetch All Active Listings
        const { data, error } = await supabase.from('listings').select('*').eq('status', 'Active');
        if (error) throw error;
        
        if (data) {
           // Parse Transport
           const trans = data.filter(d => d.type === 'Transport');
           setTransportsData(trans.map(d => ({
              id: d.id,
              title: d.title,
              image: d.image,
              year: d.duration || d.data?.duration || "",
              pricePerKm: d.pricePerKm || d.data?.pricePerKm || 6500
           })));

           // Parse Tours with Smart Logic Mapping
           const tours = data.filter(d => d.type === 'Tour' || d.type === 'Activities');
           const mappedTours = tours.map(t => {
              let basePrice = t.price || t.data?.price;
              if (!basePrice || basePrice == 0) {
                 const tiers = (t.data?.tourTiers?.length > 0) ? t.data.tourTiers : ((t.data?.allInclusiveTiers?.length > 0) ? t.data.allInclusiveTiers : []);
                 const valid = tiers.filter(tr => tr.price && Number(String(tr.price).replace(/[^0-9]/g, '')) > 0);
                 if (valid.length > 0) {
                    valid.sort((a, b) => Number(a.pax) - Number(b.pax));
                    basePrice = Number(String(valid[0].price).replace(/[^0-9]/g, '')) / (Number(valid[0].pax) || 1);
                 }
              }
              const cleanPrice = Number(String(basePrice || 0).replace(/[^0-9]/g, ''));
              
              return {
                 id: t.id,
                 locationRaw: t.location || t.data?.location || "Bali",
                 price: cleanPrice > 1000 ? cleanPrice : cleanPrice * 15000,
                 name: t.title || t.data?.title,
                 image: t.image || t.data?.images?.[0] || t.data?.gallery?.[0] || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80'
              };
           });

           // 1. Instant local cache matching (no API required)
           const regionMap = new globalThis.Map();
           const unknownTours = [];

           for (const t of mappedTours) {
             const locLower = t.locationRaw.toLowerCase();
             let matchedRegion = null;
             
             for (const [key, coords] of Object.entries(LOCATION_CACHE)) {
               if (locLower.includes(key)) {
                 matchedRegion = { id: key, name: key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), lat: coords.lat, lng: coords.lng };
                 break;
               }
             }

             if (matchedRegion) {
               if (!regionMap.has(matchedRegion.id)) {
                 regionMap.set(matchedRegion.id, matchedRegion);
               }
               t.mapRegionId = matchedRegion.id;
             } else {
               unknownTours.push(t);
             }
           }
           
           // Show cached pins immediately
           setDynamicDestinations(Array.from(regionMap.values()));
           setDbTours([...mappedTours]);

           // 2. Automatic Pin Detection Logic for unknown regions (requires API)
           if (geocodingLib && unknownTours.length > 0) {
             const geocoder = new geocodingLib.Geocoder();

             for (const t of unknownTours) {
               try {
                 const result = await new Promise((resolve) => {
                   geocoder.geocode({ address: `${t.locationRaw}, Bali, Indonesia` }, (results, status) => {
                     if (status === 'OK' && results[0]) {
                       let areaName = t.locationRaw;
                       for (const comp of results[0].address_components) {
                          if (comp.types.includes("locality") || comp.types.includes("sublocality") || comp.types.includes("administrative_area_level_3")) {
                             areaName = comp.short_name;
                             break;
                          }
                       }
                       resolve({
                         id: areaName.toLowerCase(),
                         name: areaName,
                         lat: results[0].geometry.location.lat(),
                         lng: results[0].geometry.location.lng()
                       });
                     } else {
                       resolve(null);
                     }
                   });
                 });
                 
                 if (result) {
                   if (!regionMap.has(result.id)) {
                     regionMap.set(result.id, result);
                   }
                   t.mapRegionId = result.id;
                 }
               } catch (e) {
                 console.error("Geocoding error for", t.locationRaw, e);
               }
             }
             setDynamicDestinations(Array.from(regionMap.values()));
             setDbTours([...mappedTours]); 
           }
        }
      } catch (err) {
        console.error("Failed to fetch listings", err);
      }
    };
    fetchListings();
  }, [geocodingLib]);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [activeRouteInfo, setActiveRouteInfo] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isTransportMinimized, setIsTransportMinimized] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRouteSearch = () => {
    if (pickup && dropoff) {
      setActiveRouteInfo({ origin: pickup, destination: dropoff });
      setIsTransportMinimized(true);
    }
  };

  const showTours = activeMode !== "Transport";

  const displayedTours = selectedRegion 
    ? dbTours.filter(t => t.mapRegionId === selectedRegion) 
    : dbTours;

  return (
    <>
      <Map
        defaultCenter={{ lat: -8.409518, lng: 115.188919 }}
        defaultZoom={10}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        gestureHandling="greedy"
        onTilesLoaded={() => setMapLoaded(true)}
        style={{ width: '100%', height: '100%' }}
      >
        {showTours && dynamicDestinations.map((dest) => (
          <AdvancedMarker 
            key={dest.id} 
            position={{ lat: dest.lat, lng: dest.lng }} 
            onClick={() => setSelectedRegion(dest.id)}
          >
            <div className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center ${selectedRegion === dest.id ? 'scale-110 z-10' : 'opacity-90'}`} style={{ transform: 'translate(0, -10px)' }}>
              <div className={`px-3.5 py-1.5 rounded-full font-bold text-[13px] shadow-lg whitespace-nowrap transition-colors border ${selectedRegion === dest.id ? 'bg-primary text-accent border-primary' : 'bg-white text-primary border-gray-100'}`}>
                {dest.name}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shadow-sm transition-colors ${selectedRegion === dest.id ? 'bg-primary' : 'bg-gray-400'}`}></div>
            </div>
          </AdvancedMarker>
        ))}

        {/* Dynamic Directions Render */}
        {activeRouteInfo && <DirectionsEngine routeInfo={activeRouteInfo} setRouteStats={setRouteStats} />}
      </Map>

      {!mapLoaded && <div className="absolute inset-0 bg-[#E8EAED] animate-pulse flex items-center justify-center -z-10"></div>}

      {/* OVERLAY UI */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-10 pt-12 md:pt-14 flex flex-col items-center gap-3 pointer-events-none">
        
        {activeMode === "Transport" ? (
          isTransportMinimized && activeRouteInfo ? (
            <button 
              onClick={() => setIsTransportMinimized(false)}
              className="bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-white/50 px-5 py-4 flex items-center gap-4 pointer-events-auto active:scale-[0.98] transition-all text-left w-full max-w-[400px] group"
            >
              <div className="w-3 h-3 rounded-full bg-accent relative shrink-0 z-10 shadow-[0_0_8px_rgba(217,251,65,0.8)]" />
              <div className="flex-1 font-bold text-[14.5px] text-primary truncate flex items-center gap-2">
                <span className="truncate max-w-[40%]">{pickup.split(',')[0]}</span>
                <span className="text-text-secondary/60">→</span> 
                <span className="truncate max-w-[40%]">{dropoff.split(',')[0]}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F4F4F6] flex justify-center items-center group-hover:bg-gray-200 transition-colors shrink-0">
                <Search size={14} className="text-primary" />
              </div>
            </button>
          ) : (
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-5 shadow-2xl border border-white/50 flex flex-col gap-3.5 pointer-events-auto w-full max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Filter Toggle Header for Transport Mode */}
            <div className="flex justify-between items-center px-1 mb-1">
              <h3 className="font-extrabold text-[16px] text-primary">Discover Ride</h3>
              <button onClick={() => setFilterOpen(!filterOpen)} className="w-8 h-8 flex items-center justify-center rounded-full bg-border/40 hover:bg-border/80 transition-colors">
                <SlidersHorizontal size={14} className="text-primary" />
              </button>
            </div>

            {/* If filters open, show category picker */}
            {filterOpen && (
              <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setActiveMode(cat); setActiveRouteInfo(null); setFilterOpen(false); }} className="px-4 py-1.5 rounded-full font-bold text-[12px] bg-[#F4F4F6] text-text-secondary active:scale-95">{cat}</button>
                ))}
              </div>
            )}

            <PlaceAutocompleteInput 
              placeholder="Pick-up Location..." 
              value={pickup} 
              onChange={setPickup} 
              onPlaceSelect={(val) => setPickup(val)} 
            />
            <PlaceAutocompleteInput 
              placeholder="Where to?" 
              value={dropoff} 
              onChange={setDropoff} 
              onPlaceSelect={(val) => setDropoff(val)} 
              icon={MapPin} 
            />
            
            <button 
              onClick={handleRouteSearch}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md mt-1 active:scale-[0.98] transition-transform"
            >
              Calculate Route
            </button>
          </div>
          )
        ) : (
          <div className="flex flex-col gap-2 pointer-events-auto relative w-full max-w-[400px]">
            <div className="bg-white/95 backdrop-blur-md rounded-full flex gap-3 items-center px-4 py-3.5 shadow-xl border border-white/50 relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)} 
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 text-primary active:scale-95 transition-all"
              >
                <span className="font-extrabold text-[14px] tracking-tight">{activeMode}</span>
                <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="h-5 w-px bg-border/80"></div>
              
              <input 
                type="text" 
                placeholder={`Search ${activeMode.toLowerCase()}s nearby...`}
                className="flex-1 outline-none font-medium text-[15px] bg-transparent text-primary"
              />
            </div>
            
            {/* Expanded Dropdown Filters */}
            {filterOpen && (
              <div className="absolute top-[60px] left-0 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col min-w-[140px] border border-white/50 animate-in fade-in zoom-in-95 duration-200">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { setActiveMode(cat); setFilterOpen(false); }} 
                    className={`px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeMode === cat ? 'bg-primary text-accent' : 'bg-transparent text-text-secondary hover:bg-gray-50 hover:text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transport Selection Overlay */}
      {activeMode === "Transport" && routeStats && transportsData.length > 0 && (
        <div className="absolute bottom-[96px] left-0 right-0 z-20 animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-none">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 pointer-events-auto">
             {transportsData.map(car => {
                const finalPrice = routeStats.distKm * car.pricePerKm;
                const isSelected = selectedTransport === car.id;
                return (
                  <div 
                    key={car.id} 
                    onClick={() => setSelectedTransport(car.id)} 
                    className={`snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'border-2 border-primary' : 'border border-white/50'}`}
                  >
                     <div className="flex items-center gap-4">
                       <img src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'} alt={car.title} className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm" />
                       <div className="flex-1 flex flex-col justify-center overflow-hidden">
                         <h3 className="font-bold text-[15px] leading-tight text-primary mb-1 truncate">{car.title}</h3>
                         <p className="text-[13px] text-text-secondary font-semibold">{car.year ? `Year ${car.year}` : 'Standard Vehicle'}</p>
                         <div className="text-[11px] text-gray-400 font-bold mt-1">Rp {car.pricePerKm}/km</div>
                       </div>
                     </div>
                     <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-[11px] text-text-secondary uppercase tracking-wider font-bold">{routeStats.distanceText} • {routeStats.durationText}</p>
                        </div>
                        <div className="text-[18px] font-extrabold text-primary">{formatIDR(finalPrice)}</div>
                     </div>
                     {isSelected && (
                       <button className="w-full bg-accent text-primary font-bold py-3 mt-1 rounded-xl shadow-md active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
                          Confirm Ride
                       </button>
                     )}
                  </div>
                );
             })}
          </div>
        </div>
      )}
      
      {/* Bottom Swipable Tour Cards Overlay */}
      {activeMode !== "Transport" && (
        <div className="absolute bottom-[96px] left-0 right-0 z-10 w-full animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-none">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 pointer-events-auto">
            {displayedTours.map((tour) => (
              <div key={tour.id} onClick={() => router.push(`/tours/${generateSlug(tour.name)}`)} className="snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl flex gap-4 items-center border border-white/50 cursor-pointer active:scale-[0.98] transition-transform">
                <img src={tour.image} alt={tour.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm" />
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <h3 className="font-bold text-[15px] leading-tight text-primary mb-1 truncate">{tour.name}</h3>
                  <p className="text-[13px] text-text-secondary font-semibold">Available now</p>
                  <div className="text-primary font-extrabold mt-1.5">{formatIDR(tour.price)}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent flex justify-center items-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer">
                  <Navigation size={18} className="text-primary" />
                </div>
              </div>
            ))}
            {displayedTours.length === 0 && (
              <div className="snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/50 text-center">
                <p className="font-bold text-[15px] text-primary">No tours found here yet.</p>
                <button onClick={() => setSelectedRegion(null)} className="mt-3 text-[13px] font-bold text-accent bg-primary px-4 py-2 rounded-full">View All Tours</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function MapComponent() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBvRg3xJ6dSPKSOwTRSmGUmaEfYRQ5WRCQ";
  return (
    <div className="w-full h-[100dvh] absolute inset-0 z-0">
      <APIProvider apiKey={API_KEY}>
        <MapInterface />
      </APIProvider>
    </div>
  );
}
