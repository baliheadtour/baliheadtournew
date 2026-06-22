import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full pt-16 pb-8 border-t border-border bg-surface">
      <div className="container mx-auto px-4 lg:max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
              mybalidriver
            </h2>
            <p className="text-sm text-text-secondary">
              Your ultimate premium gateway to explore the magical island of Bali. Discover tours, rentals, and hidden gems seamlessly.
            </p>
            <div className="flex items-center gap-4 mt-2 font-bold text-sm text-primary">
              <a href="#" className="hover:text-accent transition-colors">IG</a>
              <a href="#" className="hover:text-accent transition-colors">FB</a>
              <a href="#" className="hover:text-accent transition-colors">X</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Explore</h3>
            <div className="flex flex-col gap-3">
              <Link href="/tours" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Tours & Activities</Link>
              <Link href="/scooter" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Scooter Rentals</Link>
              <Link href="/spa" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Spa & Wellness</Link>
              <Link href="/hotels" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Hotels & Stays</Link>
              <Link href="/esim" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Travel eSIMs</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Helpful Links</h3>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">About Us</Link>
              <Link href="/blog" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">mybalidriver Blog</Link>
              <Link href="/contact" className="text-sm font-medium hover:translate-x-1 hover:text-accent transition-all inline-block w-max">Contact & Support</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-text-secondary">
                <MapPin size={18} className="mt-1" />
                <span className="text-sm">Jalan Raya Ubud No. 14,<br/>Ubud, Gianyar, Bali</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Phone size={18} />
                <span className="text-sm">+62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail size={18} />
                <span className="text-sm">hello@troveexperience.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} mybalidriver. All rights reserved.
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
