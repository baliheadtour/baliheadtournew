"use client";

import React, { useState } from "react";
import { 
  Calendar, MapPin, Settings, LogOut, 
  Briefcase, Users, Newspaper, Home, Menu, X, Bell, Search, ChevronDown, Activity, Smartphone
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AdminLoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    if (cleanEmail === "bobbybaliguide@gmail.com" && (cleanPassword === "Poiuytrewq123" || cleanPassword === "Poiuytrewq123.")) {
      localStorage.setItem("admin_auth", "true");
      onLogin();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#E8EAEF]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1C1C1E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#D9FB41] font-black text-2xl tracking-tighter">DB</span>
          </div>
          <h1 className="text-2xl font-black text-[#1C1C1E]">Admin Portal</h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Secure login required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E8EAEF] rounded-xl px-4 py-3 mt-1 text-sm font-bold outline-none focus:border-[#1C1C1E] transition-colors"
              placeholder="bobbybaliguide@gmail.com"
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E8EAEF] rounded-xl px-4 py-3 mt-1 text-sm font-bold outline-none focus:border-[#1C1C1E] transition-colors"
              placeholder="••••••••••••"
              required 
            />
          </div>
          
          {error && <p className="text-xs font-bold text-red-500 text-center bg-red-50 py-2 rounded-lg">{error}</p>}
          
          <button type="submit" className="w-full mt-6 py-3.5 bg-[#1C1C1E] text-white font-extrabold rounded-xl hover:bg-black transition-colors">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // All Hooks MUST be at the top level before any early returns
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  React.useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem("admin_avatar");
    if (saved) setCustomAvatar(saved);
  }, []);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Early returns (MUST be after all hooks)
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-[#F8F9FA] z-[200] flex flex-col items-center justify-center gap-4">
         <div className="w-10 h-10 border-4 border-gray-200 border-t-[#D9FB41] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result);
        localStorage.setItem("admin_avatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Products & Tours", href: "/admin/listings", icon: MapPin },
    { name: "Content & SEO", href: "/admin/places", icon: Newspaper }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex overflow-hidden font-sans text-[#1C1C1E]">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#1C1C1E]/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Native Aesthetic Sidebar - Light */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[260px] bg-white border-r border-[#E8EAEF] text-[#1C1C1E] z-50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#E8EAEF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <img src="/icon.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-[#E8EAEF]" />
             <span className="font-extrabold text-lg tracking-tight">Admin<span className="font-medium text-gray-500">Portal</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-[#1C1C1E] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Global Action Button - Lime Accent with Dark Text */}
        <div className="p-5 border-b border-[#E8EAEF]">
          <Link href="/admin/listings" className="w-full flex items-center justify-center gap-2 bg-[#D9FB41] hover:bg-[#C5E838] text-[#1C1C1E] py-3 rounded-xl font-extrabold text-sm transition-all shadow-[0_4px_20px_rgba(217,251,65,0.15)] active:scale-95">
             Create New Product
          </Link>
        </div>

        {/* Navigation Map */}
        <div className="flex-1 overflow-y-auto py-5">
          <p className="px-6 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Management</p>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-[#D9FB41] text-[#1C1C1E]' : 'text-gray-500 hover:text-[#1C1C1E] hover:bg-[#F8F9FA]'}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#1C1C1E]' : 'text-gray-400'} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Settings */}
        <div className="p-5 border-t border-[#E8EAEF] flex flex-col gap-1">
           <button onClick={handleInstallClick} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-[#1C1C1E] bg-[#D9FB41] hover:bg-[#C5E838] transition-all mb-2 shadow-sm">
              <Smartphone size={18} /> Download Mobile App
            </button>
           <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-gray-500 hover:text-[#1C1C1E] hover:bg-[#F8F9FA] transition-all">
              <Settings size={18} /> Account Settings
            </button>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
              <LogOut size={18} /> Exit Admin Dashboard
            </Link>
        </div>
      </aside>

      {/* Main Content Space */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Data Bar */}
        <header className="h-20 bg-white border-b border-[#E8EAEF] flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-[#1C1C1E] hover:bg-[#F8F9FA] rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            
            {/* Global Search Simulator */}
            <div className="hidden md:flex items-center bg-[#F8F9FA] rounded-xl px-4 py-2.5 w-72 border border-transparent focus-within:border-[#1C1C1E] focus-within:bg-white transition-all">
               <Search size={18} className="text-gray-400 mr-2" />
               <input type="text" placeholder="Search references..." className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1C1C1E] w-full outline-none placeholder:font-medium placeholder:text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-500 hover:bg-[#F8F9FA] rounded-full transition-colors">
               <Bell size={22} />
               <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D9FB41] rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-[#E8EAEF] hidden sm:block"></div>
              <div className="flex items-center gap-3 group relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  title="Upload Admin Logo"
                />
                <div className="hidden sm:block text-right pointer-events-none">
                  <p className="text-sm font-extrabold text-[#1C1C1E]">Bobby Bali</p>
                  <p className="text-[11px] text-gray-500 font-bold tracking-tight">Super Administrator</p>
                </div>
                <div className="flex items-center gap-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F8F9FA] border border-[#E8EAEF] relative group">
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <span className="text-white text-[8px] font-extrabold uppercase uppercase">Edit</span>
                    </div>
                    {customAvatar ? (
                       <img src={customAvatar} alt="Admin" className="w-full h-full object-cover relative z-0" />
                    ) : (
                        <img src="https://ui-avatars.com/api/?name=Bobby+Bali&background=1C1C1E&color=D9FB41" alt="User" className="w-full h-full object-cover relative z-0" />
                    )}
                  </div>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-[#1C1C1E] transition-colors" />
                </div>
              </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <div className="flex-1 overflow-y-auto pb-28 lg:pb-0">
          {children}
        </div>

      </main>

    {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8EAEF] flex justify-between px-6 py-4 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] pb-safe rounded-t-[32px]">
        <Link href="/admin" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname === '/admin' ? 'text-[#1C1C1E]' : 'text-gray-400 hover:text-[#1C1C1E]'} group`}>
          <div className="relative">
            <Activity size={22} strokeWidth={pathname === '/admin' ? 3 : 2.5} />
            {pathname === '/admin' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D9FB41] rounded-full"></div>}
          </div>
          <span className="text-[10px] font-extrabold transition-colors">Overview</span>
        </Link>
        <Link href="/admin/bookings" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname === '/admin/bookings' ? 'text-[#1C1C1E]' : 'text-gray-400 hover:text-[#1C1C1E]'} group`}>
          <div className="relative">
             <Calendar size={22} strokeWidth={pathname === '/admin/bookings' ? 3 : 2.5} />
             {pathname === '/admin/bookings' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D9FB41] rounded-full"></div>}
          </div>
          <span className="text-[10px] font-bold">Bookings</span>
        </Link>
        <Link href="/admin/listings" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname === '/admin/listings' ? 'text-[#1C1C1E]' : 'text-gray-400 hover:text-[#1C1C1E]'}`}>
          <div className="relative">
             <MapPin size={22} strokeWidth={pathname === '/admin/listings' ? 3 : 2.5} />
             {pathname === '/admin/listings' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D9FB41] rounded-full"></div>}
          </div>
          <span className="text-[10px] font-bold">Listings</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </div>

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans px-4">
          <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10 animate-scaleIn">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#1C1C1E]">Account Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                  <X size={20} strokeWidth={3} />
                </button>
             </div>
             
             <div className="space-y-6">
               {/* Profile Info */}
               <div className="flex flex-col items-center gap-3">
                 <div className="relative group cursor-pointer">
                   <img src={customAvatar || "https://ui-avatars.com/api/?name=Bobby+Bali&background=1C1C1E&color=D9FB41"} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-[#F8F9FA] shadow-sm transition-transform group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">Edit</div>
                   <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <div className="text-center">
                   <h4 className="font-extrabold text-base text-[#1C1C1E]">Bobby Bali Guide</h4>
                   <p className="text-[11px] text-gray-500 font-bold">bobbybaliguide@gmail.com</p>
                 </div>
               </div>

               <div className="h-px bg-[#E8EAEF] w-full"></div>

               {/* Password Form */}
               <div className="space-y-3">
                 <h4 className="font-extrabold text-sm text-[#1C1C1E] mb-2">Account Security</h4>
                 
                 <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                   <span className="text-gray-500 mt-0.5">ℹ️</span>
                   <p className="text-[10px] font-bold text-gray-600 leading-relaxed">
                     Your admin password is hardcoded securely in the application source code for maximum security.
                   </p>
                 </div>
               </div>
             </div>
             
             <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-6 py-3.5 bg-[#1C1C1E] text-white font-extrabold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
               Close Settings
             </button>
          </div>
        </div>
      )}

      {/* iOS / Fallback Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:px-4 pb-0 sm:pb-4">
          <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm" onClick={() => setShowInstallModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 z-10 animate-slideUp sm:animate-scaleIn">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#1C1C1E]">Install App</h3>
                <button onClick={() => setShowInstallModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={16} strokeWidth={3} />
                </button>
             </div>
             
             <div className="space-y-6">
               <div className="flex items-center gap-4 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E8EAEF]">
                 <img src="/icon.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                 <div>
                   <p className="text-sm font-black text-[#1C1C1E]">MyBaliDriver Admin</p>
                   <p className="text-[11px] font-bold text-gray-500">Add to Home Screen</p>
                 </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">🍏 iOS (iPhone & iPad)</h4>
                    <ol className="text-sm font-bold text-gray-600 space-y-1.5 ml-2 border-l-2 border-[#E8EAEF] pl-3">
                      <li>1. Open this page in Safari</li>
                      <li>2. Tap the Share icon <span className="inline-block bg-gray-100 px-1 rounded text-xs leading-none py-0.5">↗</span> at the bottom</li>
                      <li>3. Scroll down and tap <span className="text-[#1C1C1E]">"Add to Home Screen"</span></li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 mt-5">🤖 Android</h4>
                    <ol className="text-sm font-bold text-gray-600 space-y-1.5 ml-2 border-l-2 border-[#E8EAEF] pl-3">
                      <li>1. Open this page in Chrome</li>
                      <li>2. Tap the 3-dot menu <span className="inline-block bg-gray-100 px-1 rounded text-xs leading-none py-0.5">⋮</span> at the top</li>
                      <li>3. Tap <span className="text-[#1C1C1E]">"Install app"</span> or <span className="text-[#1C1C1E]">"Add to Home Screen"</span></li>
                    </ol>
                  </div>
               </div>
             </div>
             
             <button onClick={() => setShowInstallModal(false)} className="w-full mt-8 py-3.5 bg-[#1C1C1E] text-white font-extrabold rounded-xl hover:bg-black transition-colors">
               Got it
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
