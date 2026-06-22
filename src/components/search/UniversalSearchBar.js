"use client";

import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, Building, Wifi, CarTaxiFront } from "lucide-react";
import { TourIcon, ScooterIcon, SpaIcon, TransportIcon } from "@/components/icons/CategoryIcons";

import { Map, Bus, Sparkles, Car } from "lucide-react";

const services = [
  { id: "tours", label: "Tours", icon: Map },
  { id: "transport", label: "Transport", icon: Bus },
  { id: "activities", label: "Activities", icon: Sparkles }
];

const UniversalSearchBar = () => {
  const [activeService, setActiveService] = useState("tours");

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10">
      {/* 
        High-End Airbnb Authentic Search Widget 
        Deep drop shadow, incredibly stark border-border outlines, clean white/gray contrasts 
      */}
      <div className="bg-white md:rounded-[2.5rem] rounded-3xl p-5 md:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.08)] border border-black/5 md:border-border">
        
        {/* Responsive Service Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 md:mb-5 pb-3">
          {services.map((service) => {
            const Icon = service.icon;
            const isActive = activeService === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors whitespace-nowrap shrink-0 border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface-hover text-text-secondary border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {service.label}
              </button>
            );
          })}
        </div>

        {/* 
          Input Group Wrapper 
          Desktop: Single row pill
          Mobile: Stacked cards with thin internal dividers
        */}
        <div className="flex flex-col md:flex-row bg-white md:bg-[#F7F7F7] md:border border-gray-200 md:rounded-full rounded-2xl gap-3 md:gap-0 lg:p-0">
          
          {/* Location Input */}
          {activeService !== "esim" && (
            <div className="flex-1 bg-white md:bg-transparent rounded-2xl md:rounded-full p-4 md:p-4 pb-3 flex items-center md:items-start gap-4 border border-gray-200 shadow-sm md:border-none md:shadow-none hover:bg-gray-100 transition-colors cursor-text group relative">
              <MapPin size={22} className="text-primary md:hidden shrink-0" strokeWidth={2}/>
              <div className="flex flex-col w-full md:pl-4">
                <span className="text-[11px] md:text-xs font-bold text-primary tracking-wider uppercase mb-0.5">Where</span>
                <input 
                  type="text" 
                  placeholder={activeService === "scooter" ? "Search pickup location" : "Search destinations"} 
                  className="bg-transparent border-none outline-none text-[15px] font-medium w-full text-text-secondary placeholder-text-secondary p-0"
                />
              </div>
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-3/5 bg-gray-300"></div>
            </div>
          )}

          {/* eSIM Destination */}
          {activeService === "esim" && (
            <div className="flex-[2] bg-white md:bg-transparent rounded-2xl md:rounded-full p-4 md:p-4 pb-3 flex items-center md:items-start gap-4 border border-gray-200 shadow-sm md:border-none md:shadow-none hover:bg-gray-100 transition-colors cursor-text group relative">
              <MapPin size={22} className="text-primary md:hidden shrink-0" strokeWidth={2}/>
              <div className="flex flex-col w-full md:pl-4">
                <span className="text-[11px] md:text-xs font-bold text-primary tracking-wider uppercase mb-0.5">Destination</span>
                <input 
                  type="text" 
                  placeholder="Where are you traveling?" 
                  className="bg-transparent border-none outline-none text-[15px] font-medium w-full text-text-secondary placeholder-text-secondary p-0"
                />
              </div>
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-3/5 bg-gray-300"></div>
            </div>
          )}

          {/* Date Input */}
          <div className="flex-1 bg-white md:bg-transparent rounded-2xl md:rounded-full p-4 md:p-4 pb-3 flex items-center md:items-start gap-4 border border-gray-200 shadow-sm md:border-none md:shadow-none hover:bg-gray-100 transition-colors cursor-text group relative">
            <Calendar size={22} className="text-primary md:hidden shrink-0" strokeWidth={2}/>
            <div className="flex flex-col w-full md:pl-4">
              <span className="text-[11px] md:text-xs font-bold text-primary tracking-wider uppercase mb-0.5">
                {activeService === "hotels" ? "Check in - out" : "When"}
              </span>
              <input 
                type="text" 
                placeholder="Add dates" 
                className="bg-transparent border-none outline-none text-[15px] font-medium w-full text-text-secondary placeholder-text-secondary p-0"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
              />
            </div>
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-3/5 bg-gray-300"></div>
          </div>

          {/* Guests Input */}
          {activeService !== "scooter" && activeService !== "esim" && (
            <div className="flex-1 bg-white md:bg-transparent rounded-2xl md:rounded-full p-4 md:p-4 pb-3 flex items-center md:items-start gap-4 border border-gray-200 shadow-sm md:border-none md:shadow-none hover:bg-gray-100 transition-colors cursor-text group relative">
              <Users size={22} className="text-primary md:hidden shrink-0" strokeWidth={2}/>
              <div className="flex flex-col w-full md:pl-4">
                <span className="text-[11px] md:text-xs font-bold text-primary tracking-wider uppercase mb-0.5">Who</span>
                <input 
                  type="number" 
                  placeholder="Add guests" 
                  min="1"
                  className="bg-transparent border-none outline-none text-[15px] font-medium w-full text-text-secondary placeholder-text-secondary p-0"
                />
              </div>
            </div>
          )}

          {/* Scooter Delivery Input */}
          {activeService === "scooter" && (
            <div className="flex-1 bg-white md:bg-transparent rounded-2xl md:rounded-full p-4 md:p-4 pb-3 flex items-center md:items-start gap-4 border border-gray-200 shadow-sm md:border-none md:shadow-none hover:bg-gray-100 transition-colors cursor-text group relative">
              <CarTaxiFront size={22} className="text-primary md:hidden shrink-0" strokeWidth={2}/>
              <div className="flex flex-col w-full md:pl-4">
                <span className="text-[11px] md:text-xs font-bold text-primary tracking-wider uppercase mb-0.5">Delivery</span>
                <select className="bg-transparent border-none outline-none text-[15px] font-medium w-full text-text-secondary placeholder-text-secondary p-0 appearance-none">
                  <option value="hotel">Hotel Delivery</option>
                  <option value="airport">Airport Pickup</option>
                  <option value="office">Collect at Office</option>
                </select>
              </div>
            </div>
          )}

          {/* Checkout/Search Button */}
          <div className="mt-2 md:mt-0 md:bg-transparent p-0 md:pr-2 md:py-2 flex justify-center md:justify-end items-center md:min-w-[120px]">
            <button className="w-full md:w-auto bg-accent hover:bg-accent-hover text-white rounded-xl md:rounded-full flex items-center justify-center p-3.5 md:p-4 lg:px-6 transition-all shadow-md md:shadow-none active:scale-95 group">
              <Search size={22} strokeWidth={2.5} className="mr-2 md:mr-0 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-[15px] md:hidden tracking-wide">Search</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default UniversalSearchBar;
