import React from "react";

export const metadata = {
  title: "About Us | My Bali Driver",
};

export default function About() {
  return (
    <div className="w-full pt-32 pb-20 container mx-auto px-4 lg:max-w-7xl min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>About mybalidriver</h1>
      <p className="text-xl text-text-secondary max-w-2xl font-medium leading-relaxed">
        We are a premium platform dedicated to curating the best experiences on the island. From hidden temples and pristine beaches to luxury spa retreats and secure rentals, our goal is to streamline your perfect journey in Bali.
      </p>
    </div>
  );
}
