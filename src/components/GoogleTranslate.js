"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GoogleTranslate() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Add callback globally for the script to call
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false,
        includedLanguages: 'en,fr,es,id',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    };
  }, []);

  if (!isClient) return null;

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <Script 
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
