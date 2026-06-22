"use client";

import React, { useState, useEffect, useRef } from "react";

export default function WeeklyCalendar({ value, onChange }) {
  const [dates, setDates] = useState([]);
  const [currentMonthStr, setCurrentMonthStr] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    // Generate next 60 days starting from today
    const genDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time

    for (let i = 0; i < 60; i++) {
       const d = new Date(today);
       d.setDate(today.getDate() + i);
       genDates.push(d);
    }
    setDates(genDates);
    
    // Only auto-select if value is empty
    if (!value) {
       const yyyy = today.getFullYear();
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const dd = String(today.getDate()).padStart(2, '0');
       onChange(`${yyyy}-${mm}-${dd}`);
    }
  }, []);

  useEffect(() => {
     // update month string based on value
     const d = value ? new Date(value) : new Date();
     // Fix timezone offset issues
     const tzOffset = d.getTimezoneOffset() * 60000;
     const localDate = new Date(d.getTime() + tzOffset);
     setCurrentMonthStr(localDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  }, [value]);

  const handleSelect = (d) => {
     const yyyy = d.getFullYear();
     const mm = String(d.getMonth() + 1).padStart(2, '0');
     const dd = String(d.getDate()).padStart(2, '0');
     onChange(`${yyyy}-${mm}-${dd}`);
  };

  const isSelected = (d) => {
     if (!value) return false;
     const yyyy = d.getFullYear();
     const mm = String(d.getMonth() + 1).padStart(2, '0');
     const dd = String(d.getDate()).padStart(2, '0');
     return value === `${yyyy}-${mm}-${dd}`;
  };

  const getDayName = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="flex flex-col gap-2.5 w-full">
       <div className="flex items-center justify-between px-1">
          <span className="font-extrabold text-[15px] text-primary">{currentMonthStr}</span>
       </div>
       {/* Scrollable Container */}
       <div className="flex overflow-x-auto no-scrollbar gap-2.5 snap-x pb-2 -mx-1 px-1" ref={scrollRef}>
          {dates.map((d, i) => {
             const selected = isSelected(d);
             return (
               <div 
                 key={i} 
                 onClick={() => handleSelect(d)}
                 className={`flex-none snap-center flex flex-col items-center justify-center w-[60px] h-[75px] rounded-[18px] cursor-pointer transition-all active:scale-95 ${
                   selected ? "bg-accent text-primary shadow-sm" : "bg-white border border-gray-100 hover:bg-gray-50 text-gray-400"
                 }`}
               >
                 <span className={`text-[11px] font-bold uppercase mb-1 tracking-wider ${selected ? "text-primary/70" : "text-gray-400"}`}>{getDayName(d)}</span>
                 <span className={`text-[20px] font-extrabold leading-none ${selected ? "text-primary" : "text-primary"}`}>{d.getDate()}</span>
               </div>
             )
          })}
       </div>
    </div>
  )
}
