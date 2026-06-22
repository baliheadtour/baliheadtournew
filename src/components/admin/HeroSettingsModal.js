"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Camera, Trash2, Video, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HeroSettingsModal({ onClose }) {
  const [settings, setSettings] = useState({
    campaignVideo: "",
    campaignYoutubeLink: "",
    campaignRecommendation: "",
    campaignIgLink: "",
    campaignRecommendation2: "",
    campaignIgLink2: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [originalVideo, setOriginalVideo] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('homepage_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
      
      if (data) {
        setOriginalVideo(data.campaign_video || "");
        setSettings({
          campaignVideo: data.campaign_video || "",
          campaignYoutubeLink: data.campaign_youtube_link || "",
          campaignRecommendation: data.campaign_recommendation || "",
          campaignIgLink: data.campaign_ig_link || "",
          campaignRecommendation2: data.campaign_recommendation_2 || "",
          campaignIgLink2: data.campaign_ig_link_2 || ""
        });
      }
    } catch (err) {
      console.error("Error fetching homepage settings:", err.message);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_video_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `campaign_videos/${fileName}`;

      const { error } = await supabase.storage
        .from('discovering_bali_images')
        .upload(filePath, file);

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('discovering_bali_images').getPublicUrl(filePath);

      setSettings({ ...settings, campaignVideo: publicUrl });
    } catch (err) {
      alert("Error uploading video: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('homepage_settings').upsert({
        id: 1,
        campaign_video: settings.campaignVideo,
        campaign_youtube_link: settings.campaignYoutubeLink,
        campaign_recommendation: settings.campaignRecommendation,
        campaign_ig_link: settings.campaignIgLink,
        campaign_recommendation_2: settings.campaignRecommendation2,
        campaign_ig_link_2: settings.campaignIgLink2,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      if (originalVideo && originalVideo !== settings.campaignVideo) {
         const { deleteSupabaseFiles } = await import('@/lib/supabase');
         await deleteSupabaseFiles([originalVideo]);
      }

      // Dispatch custom event to sync with other components
      window.dispatchEvent(new Event("homepage_hero_settings_changed"));
      onClose();
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-gray-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden transform transition-transform animate-scaleIn z-10 max-h-[90dvh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
           <div>
             <h2 className="text-xl font-extrabold text-primary tracking-tight">Homepage Hero Settings</h2>
             <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide">Configure the main video & endorsement</p>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
             <X size={16} strokeWidth={3} />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
             <h3 className="font-extrabold text-primary text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <Camera size={18} className="text-accent" /> Media Background
             </h3>
             
             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">YouTube Link (Takes Priority, Includes Audio)</label>
                <div className="relative">
                   <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                   <input 
                     type="text" 
                     placeholder="e.g. https://www.youtube.com/watch?v=..." 
                     value={settings.campaignYoutubeLink} 
                     onChange={(e) => setSettings({...settings, campaignYoutubeLink: e.target.value})} 
                     className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                   />
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Direct Video Upload (Muted Loop)</label>
                {settings.campaignVideo ? (
                   <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-xs text-primary font-bold truncate pr-4 text-green-600 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Video Uploaded
                      </span>
                      <button onClick={() => setSettings({...settings, campaignVideo: ""})} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
                   </div>
                ) : (
                   <div className="relative overflow-hidden">
                      <button type="button" disabled={isUploading} className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm font-bold transition-colors border border-gray-200 text-left flex items-center justify-between">
                         {isUploading ? 'Uploading...' : 'Upload MP4 Video'}
                         <Camera size={16} />
                      </button>
                      <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   </div>
                )}
             </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
             <h3 className="font-extrabold text-primary text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <Star size={18} className="text-[#cce823] fill-[#cce823]" /> Endorsement Badge
             </h3>
             
             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Recommendation Text</label>
                <input 
                  type="text" 
                  placeholder="e.g. Highly Recommended by Zondela" 
                  value={settings.campaignRecommendation} 
                  onChange={(e) => setSettings({...settings, campaignRecommendation: e.target.value})} 
                  className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Instagram / Profile Link</label>
                <div className="relative">
                   <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={16} />
                   <input 
                     type="text" 
                     placeholder="e.g. https://instagram.com/zondela" 
                     value={settings.campaignIgLink} 
                     onChange={(e) => setSettings({...settings, campaignIgLink: e.target.value})} 
                     className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                   />
                 </div>
              </div>

             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block mt-4">Second Recommendation Text (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Featured on Travel Bali" 
                  value={settings.campaignRecommendation2 || ""} 
                  onChange={(e) => setSettings({...settings, campaignRecommendation2: e.target.value})} 
                  className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Second Instagram Link (Optional)</label>
                <div className="relative">
                   <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={16} />
                   <input 
                     type="text" 
                     placeholder="e.g. https://instagram.com/travelbali" 
                     value={settings.campaignIgLink2 || ""} 
                     onChange={(e) => setSettings({...settings, campaignIgLink2: e.target.value})} 
                     className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 focus:border-[#cce823] focus:ring-1 focus:ring-[#cce823] outline-none transition-colors" 
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex items-center justify-end gap-3">
           <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/95 transition-colors flex items-center gap-2 shadow-md">
             <Save size={18} /> Save Settings
           </button>
        </div>
      </div>
    </div>
  );
}
