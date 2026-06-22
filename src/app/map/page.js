"use client";

import React from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-[100dvh] bg-[#E8EAED] animate-pulse absolute inset-0"></div>
});

export default function MapPage() {
  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-[#E8EAED] font-sans">
      <div className="absolute inset-0 z-0">
        <Map />
      </div>
    </div>
  );
}
