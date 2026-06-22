import React from "react";
import { Wifi, Earth, Check } from "lucide-react";

export const metadata = {
  title: "Bali Travel eSIM | mybalidriver",
};

export default function Esim() {
  return (
    <div className="w-full pt-32 pb-20">
      <section className="container mx-auto px-4 lg:max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-accent font-bold text-sm tracking-widest uppercase">
              <Wifi size={16} /> Partner Integration
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text-primary tracking-tight">
              Stay Connected <br /> the Instant You Land
            </h1>
            <p className="text-lg md:text-xl font-medium text-text-secondary">
              No more searching for physical SIM cards at the airport. Scan your QR code before departure and get high-speed 4G/5G data instantly upon arrival in Bali.
            </p>
            
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex-shrink-0 text-green-600 flex items-center justify-center"><Check size={18} /></div>
                <span className="font-semibold text-text-primary text-lg">Keep your WhatsApp number active</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex-shrink-0 text-green-600 flex items-center justify-center"><Check size={18} /></div>
                <span className="font-semibold text-text-primary text-lg">Instant QR code delivery via email</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex-shrink-0 text-green-600 flex items-center justify-center"><Check size={18} /></div>
                <span className="font-semibold text-text-primary text-lg">Top-up online anytime</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-surface rounded-3xl p-8 border border-border shadow-medium relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-purple-500" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-bold text-2xl text-text-primary">Bali Travel eSIM</h3>
                  <p className="text-sm font-medium text-text-secondary mt-1">Powered by Telkomsel Network</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Earth size={24} className="text-accent" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 border-2 rounded-xl border-border hover:border-accent transition-colors cursor-pointer bg-white group/option">
                  <div>
                    <div className="font-bold text-text-primary group-hover/option:text-accent transition-colors">15 GB Data</div>
                    <div className="text-xs font-medium text-text-secondary mt-0.5">15 Days Validity</div>
                  </div>
                  <div className="font-bold text-xl text-primary group-hover/option:text-accent transition-colors">$12</div>
                </div>

                <div className="flex items-center justify-between p-4 border-2 rounded-xl border-accent bg-accent/5 cursor-pointer relative shadow-sm">
                  <div className="absolute -top-3 left-4 bg-accent text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">Most Popular</div>
                  <div>
                    <div className="font-bold text-accent">30 GB Data</div>
                    <div className="text-xs font-medium text-text-secondary mt-0.5">30 Days Validity</div>
                  </div>
                  <div className="font-bold text-xl text-accent">$20</div>
                </div>

                <div className="flex items-center justify-between p-4 border-2 rounded-xl border-border hover:border-accent transition-colors cursor-pointer bg-white group/option">
                  <div>
                    <div className="font-bold text-text-primary group-hover/option:text-accent transition-colors">Unlimited Data</div>
                    <div className="text-xs font-medium text-text-secondary mt-0.5">30 Days Validity</div>
                  </div>
                  <div className="font-bold text-xl text-primary group-hover/option:text-accent transition-colors">$35</div>
                </div>
              </div>

              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-black/80 transition-colors shadow-md">
                Buy eSIM Now
              </button>
              <p className="text-center text-xs font-medium text-text-secondary mt-4">
                You will be redirected to our trusted partner.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
