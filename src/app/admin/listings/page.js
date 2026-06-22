"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, MapPin, 
  Clock, Star, PackageOpen, MessageSquare, 
  ExternalLink, EyeOff, Link2, MessageCircle,
  ChevronDown, ChevronUp
} from "lucide-react";
import Image from "next/image";
import EditListingModal from "../../../components/admin/EditListingModal";
import EditCompanyModal from "../../../components/admin/EditCompanyModal";
import ReviewModal from "../../../components/admin/ReviewModal";
import HeroSettingsModal from "../../../components/admin/HeroSettingsModal";
import { generateSlug } from "@/lib/utils";

export default function AdminListings() {
  const [activeTab, setActiveTab] = useState("Tour");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [expandedCompanyIds, setExpandedCompanyIds] = useState([]);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);

  const allListings = {
    Tour: [],
    Activities: [],
    Transport: []
  };

  const tabs = ["Tour", "Activities", "Transport"];
  const [listingsData, setListingsData] = useState(allListings);
  const [companiesList, setCompaniesList] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchListings = async () => {
       const { supabase } = await import('@/lib/supabase');
       const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
       if (error) {
         console.error("Error fetching listings:", error);
         setIsLoading(false);
         return;
       }
         if (data) {
         const grouped = { Tour: [], Activities: [], Transport: [] };
         data.forEach(d => {
            const serviceType = d.data?.originalService || d.type;
            const frontendItem = {
               id: d.id,
               service: serviceType,
               title: d.title,
               location: d.location,
               price: d.price,
               duration: d.duration,
               category: d.category,
               rating: d.rating,
               reviews: d.reviews,
               status: d.status,
               image: d.image,
               company: d.company_name,
               ...(d.data || {}) // Spread the nested JSONB details
            };
            if(grouped[frontendItem.service]) grouped[frontendItem.service].push(frontendItem);
         });
         setListingsData(grouped);
       }

       // Fetch companies
       const { data: compData } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
       if (compData) {
         setCompaniesList(compData);
       }

       setIsLoading(false);
    };
    fetchListings();
  }, []);

  let currentListings = listingsData[activeTab].filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ((activeTab === "Activities" || activeTab === "Tour" || activeTab === "Transport") && item.company?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const matchedDbCompanies = companiesList.filter(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const legacyCompanyNames = Array.from(new Set(currentListings.filter(i => i.company).map(i => i.company)));
  
  const combinedCompanies = [...matchedDbCompanies];
  legacyCompanyNames.forEach(lname => {
     if (!combinedCompanies.find(c => c.name.toLowerCase() === lname.toLowerCase())) {
        combinedCompanies.push({ id: `legacy-${lname}`, name: lname, location: "Bali, Indonesia", joined_year: "2024", phone: "+62 800-0000-0000", verified: false });
     }
  });

  const groupedCompanies = combinedCompanies;

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
       const { supabase, deleteSupabaseFiles } = await import('@/lib/supabase');
       
       const urlsToDelete = [];
       if (item.image) urlsToDelete.push(item.image);
       if (item.gallery && Array.isArray(item.gallery)) {
         item.gallery.forEach(url => {
           if (url) urlsToDelete.push(url);
         });
       }

       const { error } = await supabase.from('listings').delete().eq('id', item.id);
       if (!error) {
         if (urlsToDelete.length > 0) {
           await deleteSupabaseFiles(urlsToDelete);
         }
         setListingsData(prev => ({
           ...prev,
           [activeTab]: prev[activeTab].filter(i => i.id !== item.id)
         }));
       } else {
         alert("Failed to delete from database: " + error.message);
       }
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Draft' : 'Active';
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', item.id);
    if (!error) {
       setListingsData(prev => ({
         ...prev,
         [activeTab]: prev[activeTab].map(i => i.id === item.id ? { ...i, status: newStatus } : i)
       }));
    }
  };

  const handleChangeCategory = async (item, newCategory) => {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('listings').update({ category: newCategory }).eq('id', item.id);
    if (!error) {
       setListingsData(prev => ({
         ...prev,
         [activeTab]: prev[activeTab].map(i => i.id === item.id ? { ...i, category: newCategory } : i)
       }));
    } else {
       alert("Error updating category: " + error.message);
    }
  };

  const handlePreview = (item) => {
    window.open(`/tours/${generateSlug(item.title)}`, '_blank');
  };

  const handleSaveItem = async (updatedItem) => {
    const { supabase, deleteSupabaseFiles } = await import('@/lib/supabase');
    
    const oldItem = listingsData[activeTab].find(i => i.id === updatedItem.id);
    const urlsToDelete = [];
    if (oldItem) {
       if (oldItem.image && oldItem.image !== updatedItem.image) {
          urlsToDelete.push(oldItem.image);
       }
       if (oldItem.gallery && Array.isArray(oldItem.gallery)) {
          oldItem.gallery.forEach(url => {
             if (url && (!updatedItem.gallery || !updatedItem.gallery.includes(url))) {
                urlsToDelete.push(url);
             }
          });
       }
    }
    
    // Deconstruct for Supabase schema
    const { 
      id, service, title, location, price, duration, category, rating, 
      reviews, status, image, company, ...nestedData 
    } = updatedItem;

    const dbPayload = {
       id: id,
       type: service === 'Activities' ? 'Tour' : service,
       title: title || "Untitled",
       location: location || "Bali",
       price: parseInt(price) || 0,
       duration: String(duration),
       category: category || "General",
       rating: parseFloat(rating) || 5.0,
       reviews: parseInt(reviews) || 0,
       status: status,
       image: image,
       company_name: company || null,
       data: {
         ...nestedData,
         originalService: service === 'Activities' ? 'Activities' : undefined
       }
    };

    const { error } = await supabase.from('listings').upsert(dbPayload);
    if (error) {
       alert("Error saving safely to database: " + error.message);
       return;
    }

    if (urlsToDelete.length > 0) {
       await deleteSupabaseFiles(urlsToDelete);
    }

    setListingsData(prev => {
      const currentList = prev[activeTab];
      const exists = currentList.find(i => i.id === updatedItem.id);
      let newList = exists 
        ? currentList.map(i => i.id === updatedItem.id ? updatedItem : i)
        : [updatedItem, ...currentList];
      return { ...prev, [activeTab]: newList };
    });
    setEditingItem(null);
  };

  const handleSaveCompany = async (companyData) => {
    const { supabase } = await import('@/lib/supabase');
    
    // Prevent ID collision on purely legacy mocked ones
    const isLegacy = String(companyData.id).startsWith("legacy-");
    const payloadToSave = { ...companyData };
    if (isLegacy || !payloadToSave.id) {
       payloadToSave.id = crypto.randomUUID();
    }

    const { error } = await supabase.from('companies').upsert(payloadToSave);
    if (error) {
       alert("Error saving company: " + error.message);
       return;
    }

    setCompaniesList(prev => {
       const exists = prev.find(c => c.id === payloadToSave.id);
       if (exists) {
          return prev.map(c => c.id === payloadToSave.id ? payloadToSave : c);
       }
       return [payloadToSave, ...prev];
    });
    setEditingCompany(null);
  };

  const toggleCompany = (companyId) => {
    if (expandedCompanyIds.includes(companyId)) {
      setExpandedCompanyIds(expandedCompanyIds.filter(id => id !== companyId));
    } else {
      setExpandedCompanyIds([...expandedCompanyIds, companyId]);
    }
  };

  const handleCreateNew = () => {
    if (activeTab === "Scooter" || activeTab === "Spa") {
       setEditingCompany({
          name: "",
          location: "Bali, Indonesia",
          phone: "",
          google_link: "",
          verified: false
       });
       return;
    }

    const newItem = {
      id: crypto.randomUUID(), // Valid UUID for Postgres!
      title: "New " + activeTab,
      location: "Bali, Indonesia",
      duration: "1 Day",
      price: "0",
      rating: "5.0",
      reviews: "0",
      service: activeTab,
      category: "Nature",
      status: "Active",
      image: ""
    };
    setEditingItem(newItem);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 md:p-8 md:pb-12 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
               {activeTab === "Scooter" ? "Scooter Inventory" : "Product Inventory"}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
               {(activeTab === "Scooter" || activeTab === "Spa")
                 ? `${groupedCompanies.length} partner companies • ${listingsData[activeTab].length} total listings` 
                 : "Add, edit, or remove your products."}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsHeroModalOpen(true)} className="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm transition-all bg-[#1C1C1E] text-[#D9FB41] hover:bg-black">
                Edit Homepage Hero
             </button>
             <button onClick={handleCreateNew} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm transition-all text-white ${(activeTab === "Scooter" || activeTab === "Spa") ? 'bg-gray-800 hover:bg-gray-900' : 'bg-[#FF5533] hover:bg-[#E64A2E]'}`}>
               <Plus size={18} strokeWidth={2.5} />
               {(activeTab === "Scooter" || activeTab === "Spa") ? "Add Company" : "Create Product"}
             </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
          
          {/* Segmented Control */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedCompanyIds([]);
                }}
                className={`flex-1 min-w-[80px] px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px bg-gray-200 mx-2"></div>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={(activeTab === "Scooter" || activeTab === "Spa") ? `Search companies or ${activeTab.toLowerCase()}s...` : `Search ${activeTab.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary pl-11 pr-4 py-3 md:py-2 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {(activeTab === "Scooter" || activeTab === "Spa") ? (
          <div className="space-y-4">
            {groupedCompanies.map(company => {
              const isExpanded = expandedCompanyIds.includes(company.id);
              const companyItems = currentListings.filter(s => s.company === company.name);
              return (
                <div key={company.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-shadow overflow-hidden">
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 bg-white">
                    <div className="flex-1 space-y-3">
                       <div className="flex flex-wrap items-center gap-3">
                         <h3 className="font-extrabold text-[18px] sm:text-[20px] text-gray-900 uppercase tracking-tight">{company.name}</h3>
                         {company.verified && (
                           <span className="bg-blue-50 text-[10px] font-extrabold text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">VERIFIED</span>
                         )}
                       </div>
                       <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] font-medium text-gray-500">
                         <div className="flex items-center gap-1.5"><MapPin size={15} className="text-gray-400" /> {company.location}</div>
                         <div className="flex items-center gap-1.5"><Link2 size={15} className="text-gray-400" /> Joined {company.joined_year || company.joined || "2024"}</div>
                         <div className="font-bold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">{companyItems.length} {activeTab}s</div>
                         <div className="flex items-center gap-1.5 bg-[#E8F8EE] text-[#1EB652] px-3 py-1.5 rounded-xl font-bold">
                           <MessageCircle size={15} className="fill-[#1EB652] text-white" /> {company.phone}
                         </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-gray-50 pt-5 md:pt-0 w-full md:w-auto mt-2 md:mt-0">
                       <button onClick={() => {
                         const newItem = {
                           id: crypto.randomUUID(),
                           title: `New ${activeTab}`,
                           company: company.name,
                           location: "Bali, Indonesia",
                           duration: activeTab === "Scooter" ? "Daily" : "60 Mins",
                           price: "0",
                           rating: "5.0",
                           reviews: "0",
                           service: activeTab,
                           category: activeTab === "Scooter" ? "Standard" : "Massage",
                           status: "Active",
                           image: ""
                         };
                         setEditingItem(newItem);
                       }} className="flex-1 md:flex-none justify-center bg-black text-white text-[12px] font-extrabold uppercase tracking-widest px-5 py-3.5 rounded-2xl sm:rounded-full flex items-center gap-2 hover:bg-black/80 transition-all shadow-md hover:shadow-lg">
                          <Plus size={16} strokeWidth={3} /> Add {activeTab}
                       </button>
                       <div className="flex items-center gap-2 ml-auto md:ml-0">
                         <button onClick={() => setEditingCompany(company)} className="w-12 h-12 rounded-2xl sm:rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => {if(confirm("Are you sure you want to remove this partner company?")) alert("Company Removed!")}} className="w-12 h-12 rounded-2xl sm:rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                            <Trash2 size={16} />
                         </button>
                         <button onClick={() => toggleCompany(company.id)} className={`w-12 h-12 rounded-2xl sm:rounded-full flex items-center justify-center text-gray-900 transition-colors ml-1 ${isExpanded ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                         </button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Expanded Sub-List */}
                  {isExpanded && (
                    <div className="bg-gray-50/50 p-3 sm:p-5 sm:pl-8 space-y-3 rounded-b-3xl border-t border-gray-100">
                       {companyItems.length > 0 ? companyItems.map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.title} className="w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] object-cover border border-gray-100 bg-gray-50" />
                                <div>
                                   <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                     <h4 className="font-extrabold text-[15px] sm:text-[16px] text-gray-900">{item.title}</h4>
                                     <span className="bg-gray-100 text-[10px] font-extrabold text-gray-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">{item.category}</span>
                                   </div>
                                   <div className="text-[13px] font-semibold text-gray-500">
                                      {(() => {
                                         let dp = item.price;
                                         if (!dp || Number(String(dp).replace(/[^0-9]/g, '')) === 0) {
                                            const tiersToUse = (item.tourTiers && item.tourTiers.length > 0) ? item.tourTiers : ((item.allInclusiveTiers && item.allInclusiveTiers.length > 0) ? item.allInclusiveTiers : []);
                                            const vt = tiersToUse.find(t => t.price && Number(String(t.price).replace(/[^0-9]/g, '')) > 0);
                                            if (vt) dp = vt.price;
                                         }
                                         const cdp = Number(String(dp || 0).replace(/[^0-9]/g, ''));
                                         return cdp > 1000 ? `Rp ${cdp.toLocaleString('id-ID')}` : `Rp ${(cdp * 15000).toLocaleString('id-ID')}`;
                                      })()} {item.duration ? `/ ${item.duration}` : ''}
                                   </div>
                                </div>
                             </div>
                             <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0 mt-1 sm:mt-0">
                                <div className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${item.status==='Active'?'bg-[#E8F8EE] text-[#1EB652]':'bg-amber-100 text-amber-700'}`}>{item.status}</div>
                                 <div className="flex items-center gap-1.5">
                                   <button onClick={() => setReviewingItem(item)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                      <MessageSquare size={14} />
                                   </button>
                                   <button onClick={() => handlePreview(item)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                      <ExternalLink size={14} />
                                   </button>
                                   <button onClick={() => handleToggleStatus(item)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                      <EyeOff size={14} />
                                   </button>
                                   <button onClick={() => handleEdit(item)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                      <Edit2 size={14} />
                                   </button>
                                   <button onClick={() => handleDelete(item)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                                      <Trash2 size={14} />
                                   </button>
                                 </div>
                              </div>
                          </div>
                       )) : (
                          <p className="text-sm font-medium text-gray-400 text-center py-6">No {activeTab.toLowerCase()}s listed under this provider yet.</p>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Regular Grid for All Other Tabs */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentListings.map(item => {
              let displayPrice = item.price;
              if (!displayPrice || Number(String(displayPrice).replace(/[^0-9]/g, '')) === 0) {
                 const tiersToUse = (item.tourTiers && item.tourTiers.length > 0) ? item.tourTiers : ((item.allInclusiveTiers && item.allInclusiveTiers.length > 0) ? item.allInclusiveTiers : []);
                 const validTier = tiersToUse.find(t => t.price && Number(String(t.price).replace(/[^0-9]/g, '')) > 0);
                 if (validTier) displayPrice = validTier.price;
              }
              const cleanDisplayPrice = Number(String(displayPrice || 0).replace(/[^0-9]/g, ''));
              return (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all flex flex-col">
              {/* Image Section */}
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className={`absolute top-3 left-3 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${item.status === 'Active' ? 'bg-[#1DBB67] text-white' : 'bg-gray-500 text-white'}`}>
                  {item.status === 'Active' ? 'PUBLISHED' : 'DRAFT'}
                </div>
                
                <div className="absolute top-3 right-3 shadow-sm rounded-full overflow-hidden">
                   <select 
                      value={item.category} 
                      onChange={(e) => handleChangeCategory(item, e.target.value)}
                      className="appearance-none bg-white font-extrabold text-[#F9703E] text-[10px] pl-3 pr-7 py-1.5 uppercase tracking-wider outline-none cursor-pointer focus:ring-0"
                   >
                      <option value="Adventure">ADVENTURE</option>
                      <option value="Water">WATER</option>
                      <option value="Nature">NATURE</option>
                      <option value="Culture">CULTURE</option>
                   </select>
                   <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#F9703E]">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                </div>
                
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  + {Math.floor(Math.random() * 4) + 2} MORE
                </div>
              </div>

              {/* Data Section */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-[15px] text-primary leading-tight mb-2 line-clamp-3 md:line-clamp-2">{item.title}</h3>
                
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-bold text-gray-400 mb-4">
                  <span>{item.duration || 'Full Day'}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-yellow-400"><Star size={12} className="fill-yellow-400 text-yellow-400" /> {item.rating}</span>
                  <span>·</span>
                  <span>{item.reviews} reviews</span>
                </div>
                
                {item.company && (
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border border-gray-100 bg-gray-50 inline-block px-2 py-0.5 rounded-md self-start">
                    Provider: <span className="text-primary">{item.company}</span>
                  </div>
                )}
                
                <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-gray-50 pt-4 gap-3 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <div className="font-black text-[18px] text-primary mb-0.5 tracking-tight">
                       {cleanDisplayPrice > 1000 ? `IDR ${cleanDisplayPrice.toLocaleString('id-ID')}` : `IDR ${(cleanDisplayPrice * 15000).toLocaleString('id-ID')}`}
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                       / {item.pricingType === "Per Group" ? 'GROUP' : 'PERSON'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-1 w-full sm:w-auto justify-end">
                    <button 
                      onClick={() => setReviewingItem(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all focus:outline-none" title="Messages">
                      <MessageSquare size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handlePreview(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all focus:outline-none" title="Preview Listing">
                      <ExternalLink size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'Draft' ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'} hover:shadow-sm transition-all focus:outline-none`} title="Toggle Visibility">
                      <EyeOff size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 hover:shadow-sm transition-all focus:outline-none" title="Edit Listing">
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 hover:shadow-sm transition-all focus:outline-none" title="Delete Listing">
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )})}
          </div>
        )}

        {currentListings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
             <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-bold text-primary mb-1">No listings found</h3>
             <p className="text-sm font-medium text-gray-500 mb-4">Try adjusting your search query or create a new listing.</p>
             {(activeTab === "Scooter" || activeTab === "Spa") && groupedCompanies.length === 0 && (
                 <button onClick={handleCreateNew} className="bg-black text-white text-sm font-extrabold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 hover:bg-black/90 transition-colors mx-auto">
                    <Plus size={16} strokeWidth={3} /> Create First {activeTab} & Company
                 </button>
             )}
          </div>
        )}

      </div>

      {/* Edit Component Render */}
      {editingItem && (
        <EditListingModal 
           item={editingItem} 
           activeTab={activeTab}
           onClose={() => setEditingItem(null)} 
           onSave={handleSaveItem}
        />
      )}
      {/* Edit Company Modal Render */}
      {editingCompany && (
        <EditCompanyModal 
           item={editingCompany} 
           onClose={() => setEditingCompany(null)} 
           onSave={handleSaveCompany}
        />
      )}
      {/* Review Modal Render */}
      {reviewingItem && (
        <ReviewModal 
           item={reviewingItem} 
           onClose={() => setReviewingItem(null)} 
        />
      )}
      {/* Hero Settings Modal */}
      {isHeroModalOpen && (
         <HeroSettingsModal onClose={() => setIsHeroModalOpen(false)} />
      )}
    </div>
  );
}
