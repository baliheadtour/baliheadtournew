"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

export default function LocationAutocomplete({ value, onChange, placeholder, icon: Icon }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&countrycodes=id&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Nominatim fetch error:", err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ name: val, url: "", coords: null });
    
    if (val.length >= 3) {
      setShowDropdown(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 500);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    const locationName = item.name || item.display_name.split(',')[0];
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    const url = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
    setQuery(locationName);
    onChange({ name: locationName, url, coords });
    setShowDropdown(false);
  };

  return (
    <div className="relative flex flex-col" ref={dropdownRef}>
      <div className="relative flex items-center w-full">
        {Icon && <Icon className="absolute left-4 text-gray-400 z-10" size={18} />}
        <input 
          required 
          type="text" 
          value={query} 
          onChange={handleInputChange}
          onFocus={() => { if(query.length >= 3) setShowDropdown(true); }}
          placeholder={placeholder} 
          className="w-full bg-[#F4F4F6] rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400" 
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[200px] overflow-y-auto">
          {suggestions.map((item, idx) => (
            <div 
              key={item.place_id || idx} 
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => handleSelect(item)}
            >
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] font-bold text-primary truncate">{item.name || item.display_name.split(',')[0]}</span>
                <span className="text-[11px] text-gray-400 truncate">{item.display_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
