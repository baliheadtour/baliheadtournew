"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export default function LocationAutocomplete({ value, onChange, placeholder, icon: Icon }) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const options = { 
      fields: ["geometry", "name", "formatted_address", "url"], 
      componentRestrictions: { country: "id" } // Restricted to Indonesia for Bali
    };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    const listener = placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();
      
      const locationName = place.name || place.formatted_address || inputRef.current.value;
      let url = place.url;
      
      if (!url && locationName) {
         // Fallback URL if Google didn't provide one directly
         url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
      }

      onChange({
        name: locationName,
        url: url || ""
      });
    });
    
    return () => {
      if (listener && window.google) {
        window.google.maps.event.removeListener(listener);
      }
    }
  }, [onChange, placeAutocomplete]);

  return (
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-4 text-gray-400" size={18} />}
      <input 
        ref={inputRef}
        required 
        type="text" 
        value={value} 
        onChange={(e) => onChange({ name: e.target.value, url: "" })} 
        placeholder={placeholder} 
        className="w-full bg-[#F4F4F6] rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400" 
      />
    </div>
  );
}
