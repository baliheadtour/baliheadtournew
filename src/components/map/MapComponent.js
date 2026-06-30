"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Navigation, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import LocationAutocomplete from "../booking/LocationAutocomplete";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components since Leaflet uses window/document
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then(mod => mod.useMap), { ssr: false });

import { parsePrice, formatUSD } from '@/lib/currency';

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
  'ulun danu': { lat: -8.2833, lng: 115.1667 }
};

const CATEGORIES = ["Tour", "Transport", "Activities"];

function DirectionsEngine({ routeInfo, setRouteStats }) {
  const map = useMap();
  const [routeLine, setRouteLine] = useState(null);

  useEffect(() => {
    if (!routeInfo || !routeInfo.originCoords || !routeInfo.destinationCoords) return;
    const fetchRoute = async () => {
      try {
        const { originCoords, destinationCoords } = routeInfo;
        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const latLngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteLine(latLngs);
          
          const distKm = route.distance / 1000;
          const distText = distKm.toFixed(1) + ' km';
          
          const mins = Math.round(route.duration / 60);
          const hours = Math.floor(mins / 60);
          const remainMins = mins % 60;
          let durationText = '';
          if (hours > 0) durationText += `${hours}h `;
          if (remainMins > 0) durationText += `${remainMins}m`;
          if (!durationText) durationText = '1m';
          
          setRouteStats({
            distKm,
            distanceText: distText,
            durationText: durationText.trim()
          });
          
          import('leaflet').then(L => {
            const bounds = L.latLngBounds(latLngs);
            map.fitBounds(bounds, { padding: [50, 50] });
          });
        } else {
          setRouteStats(null);
          setRouteLine(null);
        }
      } catch (err) {
        console.error("OSRM Error", err);
      }
    };
    fetchRoute();
  }, [routeInfo, map, setRouteStats]);

  if (!routeLine) return null;
  return <Polyline positions={routeLine} color="#1E1E24" weight={4} />;
}

// Ensure leaflet is loaded for custom icons
let L;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

function MapInterface() {
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const [transportsData, setTransportsData] = useState([]);
  const [dbTours, setDbTours] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [dynamicDestinations, setDynamicDestinations] = useState([]);
  
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
        
        const { data, error } = await supabase.from('listings').select('*').eq('status', 'Active');
        if (error) throw error;
        
        if (data) {
           const trans = data.filter(d => d.type === 'Transport');
           setTransportsData(trans.map(d => ({
              id: d.id,
              title: d.title,
              image: d.image,
              year: d.duration || d.data?.duration || "",
              pricePerKm: d.pricePerKm || d.data?.pricePerKm || 6500
           })));

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
           
           setDynamicDestinations(Array.from(regionMap.values()));
           setDbTours([...mappedTours]);

           if (unknownTours.length > 0) {
             for (const t of unknownTours) {
               try {
                 const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(t.locationRaw + ", Bali")}&format=json&limit=1`);
                 const results = await res.json();
                 
                 if (results && results[0]) {
                   const resultId = t.locationRaw.toLowerCase();
                   const result = {
                     id: resultId,
                     name: t.locationRaw,
                     lat: parseFloat(results[0].lat),
                     lng: parseFloat(results[0].lon)
                   };
                   if (!regionMap.has(result.id)) {
                     regionMap.set(result.id, result);
                   }
                   t.mapRegionId = result.id;
                 }
                 // Delay to avoid Nominatim rate limit
                 await new Promise(r => setTimeout(r, 1000));
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
  }, []);

  const [pickup, setPickup] = useState({ name: "", coords: null });
  const [dropoff, setDropoff] = useState({ name: "", coords: null });
  const [activeRouteInfo, setActiveRouteInfo] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isTransportMinimized, setIsTransportMinimized] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRouteSearch = () => {
    if (pickup.coords && dropoff.coords) {
      setActiveRouteInfo({ 
        origin: pickup.name, 
        destination: dropoff.name, 
        originCoords: pickup.coords, 
        destinationCoords: dropoff.coords 
      });
      setIsTransportMinimized(true);
    } else {
      alert("Please select valid locations from the dropdown");
    }
  };

  const showTours = activeMode !== "Transport";
  const displayedTours = selectedRegion 
    ? dbTours.filter(t => t.mapRegionId === selectedRegion) 
    : dbTours;

  const createCustomIcon = (dest, isSelected) => {
    if (!L) return null;
    const html = `
      <div class="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center ${isSelected ? 'scale-110 z-10' : 'opacity-90'}" style="transform: translate(0, -10px)">
        <div class="px-3.5 py-1.5 rounded-full font-bold text-[13px] shadow-lg whitespace-nowrap transition-colors border ${isSelected ? 'bg-[#cce823] text-[#1C1C1E] border-[#cce823]' : 'bg-white text-[#1C1C1E] border-gray-100'}">
          ${dest.name}
        </div>
        <div class="w-1.5 h-1.5 rounded-full mt-1.5 shadow-sm transition-colors ${isSelected ? 'bg-[#cce823]' : 'bg-gray-400'}"></div>
      </div>
    `;
    return L.divIcon({ html, className: '', iconSize: [0, 0] });
  };

  return (
    <>
      <MapContainer
        center={[-8.409518, 115.188919]}
        zoom={10}
        zoomControl={false}
        whenReady={() => setMapLoaded(true)}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {showTours && L && dynamicDestinations.map((dest) => (
          <Marker 
            key={dest.id} 
            position={[dest.lat, dest.lng]} 
            icon={createCustomIcon(dest, selectedRegion === dest.id)}
            eventHandlers={{
              click: () => setSelectedRegion(dest.id)
            }}
          />
        ))}

        {activeRouteInfo && <DirectionsEngine routeInfo={activeRouteInfo} setRouteStats={setRouteStats} />}
      </MapContainer>

      {!mapLoaded && <div className="absolute inset-0 bg-[#E8EAED] animate-pulse flex items-center justify-center -z-10"></div>}

      {/* OVERLAY UI */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-[1000] pt-12 md:pt-14 flex flex-col items-center gap-3 pointer-events-none">
        
        {activeMode === "Transport" ? (
          isTransportMinimized && activeRouteInfo ? (
            <button 
              onClick={() => setIsTransportMinimized(false)}
              className="bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-white/50 px-5 py-4 flex items-center gap-4 pointer-events-auto active:scale-[0.98] transition-all text-left w-full max-w-[400px] group"
            >
              <div className="w-3 h-3 rounded-full bg-[#cce823] relative shrink-0 z-10 shadow-[0_0_8px_rgba(204,232,35,0.8)]" />
              <div className="flex-1 font-bold text-[14.5px] text-[#1C1C1E] truncate flex items-center gap-2">
                <span className="truncate max-w-[40%]">{pickup.name.split(',')[0]}</span>
                <span className="text-[#8F8F99]/60">→</span> 
                <span className="truncate max-w-[40%]">{dropoff.name.split(',')[0]}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F4F4F6] flex justify-center items-center group-hover:bg-gray-200 transition-colors shrink-0">
                <Search size={14} className="text-[#1C1C1E]" />
              </div>
            </button>
          ) : (
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-5 shadow-2xl border border-white/50 flex flex-col gap-3.5 pointer-events-auto w-full max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center px-1 mb-1">
              <h3 className="font-extrabold text-[16px] text-[#1C1C1E]">Discover Ride</h3>
              <button onClick={() => setFilterOpen(!filterOpen)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <SlidersHorizontal size={14} className="text-[#1C1C1E]" />
              </button>
            </div>

            {filterOpen && (
              <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setActiveMode(cat); setActiveRouteInfo(null); setFilterOpen(false); }} className="px-4 py-1.5 rounded-full font-bold text-[12px] bg-[#F4F4F6] text-[#8F8F99] active:scale-95">{cat}</button>
                ))}
              </div>
            )}

            <LocationAutocomplete 
              placeholder="Pick-up Location..." 
              value={pickup.name} 
              onChange={setPickup} 
            />
            <LocationAutocomplete 
              placeholder="Where to?" 
              value={dropoff.name} 
              onChange={setDropoff} 
              icon={MapPin} 
            />
            
            <button 
              onClick={handleRouteSearch}
              className="w-full bg-[#1C1C1E] text-white font-bold py-3.5 rounded-xl shadow-md mt-1 active:scale-[0.98] transition-transform"
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
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 text-[#1C1C1E] active:scale-95 transition-all"
              >
                <span className="font-extrabold text-[14px] tracking-tight">{activeMode}</span>
                <ChevronDown size={14} className={`text-[#8F8F99] transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="h-5 w-px bg-gray-200"></div>
              
              <input 
                type="text" 
                placeholder={`Search ${activeMode.toLowerCase()}s nearby...`}
                className="flex-1 outline-none font-medium text-[15px] bg-transparent text-[#1C1C1E]"
              />
            </div>
            
            {filterOpen && (
              <div className="absolute top-[60px] left-0 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col min-w-[140px] border border-white/50 animate-in fade-in zoom-in-95 duration-200">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { setActiveMode(cat); setFilterOpen(false); }} 
                    className={`px-4 py-2.5 rounded-xl font-bold text-[13px] text-left transition-colors ${activeMode === cat ? 'bg-[#1C1C1E] text-[#cce823]' : 'bg-transparent text-[#8F8F99] hover:bg-gray-50 hover:text-[#1C1C1E]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeMode === "Transport" && routeStats && transportsData.length > 0 && (
        <div className="absolute bottom-[96px] left-0 right-0 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-none">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 pointer-events-auto">
             {transportsData.map(car => {
                const finalPrice = routeStats.distKm * car.pricePerKm;
                const isSelected = selectedTransport === car.id;
                return (
                  <div 
                    key={car.id} 
                    onClick={() => setSelectedTransport(car.id)} 
                    className={`snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'border-2 border-[#1C1C1E]' : 'border border-white/50'}`}
                  >
                     <div className="flex items-center gap-4">
                       <img src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'} alt={car.title} className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm" />
                       <div className="flex-1 flex flex-col justify-center overflow-hidden">
                         <h3 className="font-bold text-[15px] leading-tight text-[#1C1C1E] mb-1 truncate">{car.title}</h3>
                         <p className="text-[13px] text-[#8F8F99] font-semibold">{car.year ? `Year ${car.year}` : 'Standard Vehicle'}</p>
                         <div className="text-[11px] text-gray-400 font-bold mt-1">${parsePrice(car.pricePerKm)}/km</div>
                       </div>
                     </div>
                     <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-[11px] text-[#8F8F99] uppercase tracking-wider font-bold">{routeStats.distanceText} • {routeStats.durationText}</p>
                        </div>
                        <div className="text-[18px] font-extrabold text-[#1C1C1E]">{formatUSD(parsePrice(finalPrice))}</div>
                     </div>
                     {isSelected && (
                       <button className="w-full bg-[#cce823] text-[#1C1C1E] font-bold py-3 mt-1 rounded-xl shadow-md active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
                          Confirm Ride
                       </button>
                     )}
                  </div>
                );
             })}
          </div>
        </div>
      )}
      
      {activeMode !== "Transport" && (
        <div className="absolute bottom-[96px] left-0 right-0 z-[1000] w-full animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-none">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 pointer-events-auto">
            {displayedTours.map((tour) => (
              <div key={tour.id} onClick={() => router.push(`/tours/${generateSlug(tour.name)}`)} className="snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl flex gap-4 items-center border border-white/50 cursor-pointer active:scale-[0.98] transition-transform">
                <img src={tour.image} alt={tour.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm" />
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <h3 className="font-bold text-[15px] leading-tight text-[#1C1C1E] mb-1 truncate">{tour.name}</h3>
                  <p className="text-[13px] text-[#8F8F99] font-semibold">Available now</p>
                  <div className="text-[#1C1C1E] font-extrabold mt-1.5">{formatUSD(parsePrice(tour.price))}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#cce823] flex justify-center items-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer">
                  <Navigation size={18} className="text-[#1C1C1E]" />
                </div>
              </div>
            ))}
            {displayedTours.length === 0 && (
              <div className="snap-center shrink-0 w-[calc(100vw-64px)] max-w-[320px] bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/50 text-center">
                <p className="font-bold text-[15px] text-[#1C1C1E]">No tours found here yet.</p>
                <button onClick={() => setSelectedRegion(null)} className="mt-3 text-[13px] font-bold text-[#cce823] bg-[#1C1C1E] px-4 py-2 rounded-full">View All Tours</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function MapComponent() {
  return (
    <div className="w-full h-[100dvh] absolute inset-0 z-0">
      <MapInterface />
    </div>
  );
}
