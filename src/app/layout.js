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
  metadataBase: new URL("https://www.bobbybaliguide.com"),
  applicationName: "MyBaliDriver",
  title: {
    default: "MyBaliDriver | Best Private Drivers & Premium Tours in Bali",
    template: "%s | MyBaliDriver"
  },
  description: "Experience the best of Bali and Ubud with MyBaliDriver. Top-rated private car charters, experienced local guides, and bespoke luxury tour packages. Book your unforgettable Bali adventure today!",
  keywords: ["Bali Private Driver", "Hire Driver in Bali", "Bali Car Charter", "Premium Bali Tours", "Ubud Day Tour", "Nusa Penida Tour Package", "Bali Airport Transfer", "Custom Bali Itinerary", "Local Bali Guide", "Best Driver in Ubud"],
  authors: [{ name: "MyBaliDriver" }],
  creator: "MyBaliDriver",
  publisher: "MyBaliDriver",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "MyBaliDriver | Best Private Drivers & Premium Tours in Bali",
    description: "Experience the best of Bali and Ubud with MyBaliDriver. Top-rated private car charters, experienced local guides, and bespoke luxury tour packages.",
    url: "https://www.bobbybaliguide.com",
    siteName: "MyBaliDriver",
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
    title: "MyBaliDriver | Best Private Drivers & Premium Tours in Bali",
    description: "Experience the best of Bali and Ubud with MyBaliDriver. Top-rated private car charters, experienced local guides, and bespoke luxury tour packages.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MyBaliDriver",
    "alternateName": ["My Bali Driver", "Bobby Bali Guide"],
    "url": "https://www.bobbybaliguide.com/"
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
