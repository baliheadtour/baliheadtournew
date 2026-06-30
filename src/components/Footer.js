import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full pt-16 pb-8 border-t border-border bg-surface">
      <div className="container mx-auto px-4 lg:max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center text-primary" style={{ fontFamily: 'var(--font-playfair)' }}>
              baliheadtour
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Your ultimate premium gateway to explore the magical island of Bali. Discover tours, rentals, and hidden gems seamlessly.
            </p>
            <div className="flex items-center gap-5 mt-4 text-sm font-medium text-text-secondary">
              <a href="#" className="hover:text-primary transition-colors">IG</a>
              <a href="#" className="hover:text-primary transition-colors">FB</a>
              <a href="#" className="hover:text-primary transition-colors">X</a>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:ml-auto">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-primary">Explore</h3>
            <div className="flex flex-col gap-3">
              <Link href="/tours" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Tours & Activities</Link>
              <Link href="/scooter" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Scooter Rentals</Link>
              <Link href="/spa" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Spa & Wellness</Link>
              <Link href="/hotels" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Hotels & Stays</Link>
              <Link href="/esim" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Travel eSIMs</Link>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:ml-auto">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-primary">Helpful Links</h3>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">About Us</Link>
              <Link href="/blog" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">baliheadtour Blog</Link>
              <Link href="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors inline-block w-max">Contact & Support</Link>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:ml-auto">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-primary">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-text-secondary hover:text-primary transition-colors">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm leading-tight">Jalan Raya Ubud No. 14,<br/>Ubud, Gianyar, Bali</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors">
                <Phone size={18} className="shrink-0" />
                <span className="text-sm">+62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors">
                <Mail size={18} className="shrink-0" />
                <span className="text-sm">hello@troveexperience.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} baliheadtour. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>Powered by Premium Travel Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

