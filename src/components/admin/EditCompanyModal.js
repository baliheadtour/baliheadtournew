"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, Image as ImageIcon, MapPin, Camera, Building, Phone, Calendar, Link2, CheckCircle2 } from "lucide-react";

export default function EditCompanyModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    location: item?.location || "",
    phone: item?.phone || "",
    joined_year: item?.joined_year || new Date().getFullYear().toString(),
    verified: item?.verified || false,
    google_link: item?.google_link || "",
    image: item?.image || "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `companies/${fileName}`;

      const { error } = await supabase.storage
        .from('discovering_bali_images')
        .upload(filePath, file);

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('discovering_bali_images').getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
    } catch (err) {
      alert("Error uploading image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    const payload = {
      ...item,
      ...formData,
      // Default integer fallbacks to avoid SQL errors
      rating: item?.rating || 5.0,
      reviews: item?.reviews || 0,
      fleet_size: item?.fleet_size || 1
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center font-sans">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gray-50 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden z-10 animate-slideUp sm:animate-scaleIn border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
           <div>
             <h2 className="text-xl font-extrabold text-primary tracking-tight">{item?.id ? 'Edit' : 'Create'} Company Profile</h2>
             <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide">Add a new provider for Scooters or Spas</p>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
             <X size={16} strokeWidth={3} />
           </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="space-y-6 max-w-xl mx-auto">
             
            {/* Core Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Building size={14}/> Company Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent outline-none" placeholder="e.g. Balinese Wellness Spa" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Link2 size={14}/> Google Business Link</label>
                    <input type="text" name="google_link" value={formData.google_link} onChange={handleChange} className="w-full bg-gray-50 text-sm font-semibold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-accent outline-none" placeholder="https://maps.google.com/..." />
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Allows prospects to see real external reviews</p>
                  </div>
               </div>
               <div className="p-4 flex gap-4 sm:flex-row flex-col">
                 <div className="flex-[2]">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><MapPin size={14}/> Location Base</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-50 text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-gray-200 focus:border-accent outline-none" placeholder="Ubud, Bali" />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Phone size={14}/> Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 text-sm font-semibold text-primary rounded-xl px-4 py-2 border border-gray-200 focus:border-accent outline-none" placeholder="+62 812..." />
                 </div>
               </div>
            </div>

            {/* Verification and Badges */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                 <div className="flex items-center gap-2 text-sm font-extrabold text-primary"><CheckCircle2 size={16} className="text-green-500"/> Verified Partner Badge</div>
                 <p className="text-[11px] font-semibold text-gray-500">Shows a green mark next to the company name</p>
               </div>
               <div 
                 onClick={() => setFormData({...formData, verified: !formData.verified})}
                 className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.verified ? 'bg-green-500' : 'bg-gray-200'}`}>
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.verified ? 'translate-x-6' : ''}`} />
               </div>
            </div>

            {/* Profile Image */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-200 shrink-0 relative flex items-center justify-center">
                  {formData.image ? (
                    <img src={formData.image} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building size={32} className="text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                   <h3 className="text-sm font-extrabold text-primary uppercase tracking-widest">Company Logo</h3>
                   <p className="text-xs font-medium text-gray-500 leading-relaxed">Upload a clear logo or storefront photo. Aspect ratio 1:1 recommended. Maximum size 2MB.</p>
                   {isUploading && <p className="text-xs font-bold text-accent">Uploading image...</p>}
                </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 sm:p-6 bg-white border-t border-gray-100 shrink-0 flex items-center justify-end gap-3 pb-safe">
           <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/95 transition-colors flex items-center gap-2 shadow-md">
             <Save size={18} /> Save Company
           </button>
        </div>

      </div>
    </div>
  );
}
