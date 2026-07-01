import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/navigation/BottomNav";
import AuthProvider from "@/components/providers/AuthProvider";
import GoogleTranslate from "@/components/GoogleTranslate";
import SplashScreen from "@/components/SplashScreen";
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: '--font-playfair' });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://www.baliheadtour.com"),
  applicationName: "Bali Head Tour",
  title: {
    default: "Bali Head Tour | #1 Private Driver & Custom Tours in Bali",
    template: "%s | Bali Head Tour"
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  description: "Experience the ultimate Bali holiday with our top-rated private drivers and custom tour packages. We offer affordable car charters, English-speaking local guides, and personalized itineraries to Ubud, Nusa Penida, Seminyak, and beyond.",
  keywords: [
    "Bali Private Driver", "Hire Driver in Bali", "Bali Car Charter", "Premium Bali Tours", 
    "Ubud Day Tour", "Nusa Penida Tour Package", "Bali Airport Transfer", "Custom Bali Itinerary", 
    "Local Bali Guide", "Best Driver in Ubud", "Uluwatu Temple Tour", "Mount Batur Sunrise Trekking", 
    "Seminyak Shopping Tour", "Canggu Beach Club Tour", "Lempuyang Heaven Gate Tour", 
    "Bali Water Sports", "ATV Ride Bali", "Bali Swing Ubud", "Tanah Lot Sunset Tour", 
    "Kintamani Volcano Tour", "Lovina Dolphin Watching", "Jimbaran Seafood Dinner", 
    "Bali Family Holiday Packages", "Bali Honeymoon Tours", "Affordable Bali Driver",
    "Bali Transport Services", "English Speaking Driver Bali", "Bali Sightseeing Tours"
  ],
  authors: [{ name: "Bali Head Tour" }],
  creator: "Bali Head Tour",
  publisher: "Bali Head Tour",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Bali Head Tour | #1 Private Driver & Custom Tours in Bali",
    description: "Experience the ultimate Bali holiday with our top-rated private drivers and custom tour packages. We offer affordable car charters, English-speaking local guides, and personalized itineraries to Ubud, Nusa Penida, Seminyak, and beyond.",
    url: "https://www.baliheadtour.com",
    siteName: "Bali Head Tour",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ubud Full-Day Tour: Monkey Forest, Rice Terraces, Temple & Waterfall",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Bali Head Tour | #1 Private Driver & Custom Tours in Bali",
    description: "Experience the ultimate Bali holiday with our top-rated private drivers and custom tour packages. We offer affordable car charters, English-speaking local guides, and personalized itineraries to Ubud, Nusa Penida, Seminyak, and beyond.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bali Head Tour",
    "alternateName": ["Bali Head Tour", "Bali Head Tour"],
    "url": "https://www.baliheadtour.com/"
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${playfair.variable} min-h-screen flex flex-col bg-background selection:bg-accent selection:text-primary pb-24 md:pb-0`}>
        <AuthProvider>
          <SplashScreen>
            <GoogleTranslate />
            {/* Navbar handles its own desktop/mobile responsive states now */}
            <Navbar />
            
            <main className="flex-grow w-full relative pt-20 md:pt-24">
              {children}
            </main>
            
            {/* New App-style floating bottom navigation */}
            <BottomNav />

            {/* Hide default Footer on mobile as we rely on bottom nav */}
            <div className="hidden md:block">
              <Footer />
            </div>
          </SplashScreen>
        </AuthProvider>
      </body>
    </html>
  );
}
