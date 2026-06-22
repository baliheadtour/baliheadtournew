import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact Us | My Bali Driver",
};

export default function Contact() {
  return (
    <div className="w-full pt-32 pb-20 container mx-auto px-4 lg:max-w-7xl min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary tracking-tight">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        <div className="bg-surface p-8 rounded-3xl shadow-soft border border-border flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-accent rounded-full flex items-center justify-center"><Mail size={24} /></div>
          <h3 className="font-bold text-lg">Email Support</h3>
          <p className="text-text-secondary font-medium">hello@discoveringbali.com</p>
        </div>
        
        <div className="bg-surface p-8 rounded-3xl shadow-soft border border-border flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><Phone size={24} /></div>
          <h3 className="font-bold text-lg">Direct Call</h3>
          <p className="text-text-secondary font-medium">+62 812 3456 7890</p>
        </div>

        <div className="bg-surface p-8 rounded-3xl shadow-soft border border-border flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><MapPin size={24} /></div>
          <h3 className="font-bold text-lg">Headquarters</h3>
          <p className="text-text-secondary font-medium">Jalan Raya Ubud No. 14, Bali</p>
        </div>
      </div>
    </div>
  );
}
