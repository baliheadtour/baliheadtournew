"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, MapPin, MoreVertical, Trash2, Edit2, Newspaper, EyeOff, X, ImageIcon, Camera, Globe, Sparkles, Loader2 } from "lucide-react";

export default function SEOPlacesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [formData, setFormData] = useState({ title: "", location: "", category: "Beach", slug: "", meta: "", status: "Published", image: "", images: [], content: "" });
  const textareaRef = React.useRef(null);

  const insertFormat = (formatStart, formatEnd = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || '';
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + formatStart + selectedText + formatEnd + text.substring(end);
    
    setFormData(prev => ({...prev, content: newText}));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatStart.length, end + formatStart.length);
    }, 0);
  };

  const initialPlaces = [
    { 
      id: "PLC-001", 
      title: "10 Hidden Beaches in Uluwatu You Must Visit", 
      location: "Uluwatu, South Kuta", 
      category: "Beach", 
      slug: "/blog/uluwatu-hidden-beaches", 
      meta: "Discover the untouched spots in Uluwatu, from Nyang Nyang to Green Bowl, that still offer powdery white sand, turquoise waters, and an escape from the crowds.",
      views: "1.2K", 
      status: "Published", 
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800", 
      images: [], 
      content: "<h2>Discover the Untouched Beauty of Uluwatu</h2><p>Uluwatu is renowned for its sheer limestone cliffs and world-class surfing breaks, but beyond the famous Padang Padang and Suluban lies a treasure trove of hidden beaches waiting to be explored. If you are looking for powdery white sand, crystal-clear turquoise waters, and a quiet escape from the crowds, you are in the right place.</p><h3>1. Nyang Nyang Beach</h3><p>One of Bali's most pristine stretches of sand, Nyang Nyang requires a steep descent down the cliffside, but the reward is a massive, uncrowded beach. The shipwreck remnants serve as the perfect backdrop for photography.</p><h3>2. Thomas Beach</h3><p>Tucked between Padang Padang and Suluban, Thomas Beach is a sandy cove that has managed to stay relatively off the radar. The calm waters make it an excellent spot for swimming and relaxing under a parasol.</p><h3>3. Green Bowl Beach</h3><p>Accessible down hundreds of concrete steps, Green Bowl is famous for its caves and incredible reef breaks. Due to the exertion required to reach it, it remains refreshingly empty most of the day.</p><h3>Essential Tips for Visiting</h3><ul><li><strong>Start Early:</strong> Beat the midday sun, especially for beaches with steep staircases.</li><li><strong>Tides Matter:</strong> Many Uluwatu beaches disappear at high tide, so always check local tide charts.</li><li><strong>Pack Water:</strong> Facilities are limited on these hidden gems.</li></ul><p>Whether you're an avid surfer or just a sun-seeker, Uluwatu's hidden coastline represents the very best of Bali's natural beauty. Leave no trace, and enjoy paradise!</p>" 
    },
    { 
      id: "PLC-002", 
      title: "Ultimate Guide to Ubud Monkey Forest", 
      location: "Ubud, Gianyar", 
      category: "Nature", 
      slug: "/blog/ubud-monkey-forest-guide", 
      meta: "A comprehensive guide to the Sacred Monkey Forest Sanctuary in Ubud, featuring essential tips, temple history, and rules for a safe, unforgettable visit.",
      views: "3.4K", 
      status: "Published", 
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800", 
      images: [], 
      content: "<h2>The Sacred Heart of Ubud</h2><p>The Sacred Monkey Forest Sanctuary isn't just an attraction—it's a spiritual and ecological sanctuary right in the bustling center of Ubud. Home to over 1,000 Balinese long-tailed macaques and three ancient Hindu temples, it's a place where nature, culture, and mythology intertwine perfectly.</p><h3>What to Expect</h3><p>As you walk through the lush, dense nutmeg forest, you'll be greeted by ancient banyan trees draped over moss-covered ravines and intricate stone dragon bridges. The macaques roam freely here, observing humans just as closely as we observe them.</p><h3>The Three Temples</h3><p>Deep within the forest lie three historically significant temples built around the 14th century: <strong>Pura Dalem Agung Padangtegal</strong> (the main temple), <strong>Pura Beji</strong> (the bathing temple), and <strong>Pura Prajapati</strong>. These structures are vital to the local spiritual community.</p><h3>Rules for a Safe Visit</h3><ul><li><strong>No Eye Contact:</strong> Staring is considered aggressive in monkey culture.</li><li><strong>Secure Your Belongings:</strong> The monkeys are incredibly curious. Keep sunglasses, water bottles, and phones packed away securely.</li><li><strong>Do Not Feed Them:</strong> The sanctuary staff provides a strict diet for the macaques. Feeding them outside snacks can lead to aggressive behavior.</li></ul><p>Visiting the Monkey Forest is an unforgettable experience that offers a profound glimpse into Bali's philosophy of <em>Tri Hita Karana</em>—harmony between humans, nature, and the divine.</p>" 
    },
    { 
      id: "PLC-003", 
      title: "Best Sunset Spots in Seminyak", 
      location: "Seminyak, Kuta", 
      category: "Nightlife", 
      slug: "/blog/best-seminyak-sunsets", 
      views: "800", 
      status: "Draft", 
      image: "", 
      images: [], 
      content: "Seminyak is famous for its vibrant nightlife..." 
    }
  ];

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      if (res.ok) {
        const data = await res.json();
        // Map meta_description back to meta for the frontend state
        const mappedData = data.map(d => ({ ...d, meta: d.meta_description || d.meta }));
        setPlaces(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setOpenDropdown(null);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setPlaces(places.map(p => p.id === id ? { ...p, status: newStatus } : p));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (id) => {
    setOpenDropdown(null);
    if (confirm("Permanently delete this blog/place entry? It will impact SEO.")) {
      try {
        const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPlaces(places.filter(p => p.id !== id));
        } else {
          alert("Failed to delete");
        }
      } catch (err) {
        alert("Network error");
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const openEditModal = (place) => {
    setEditingPlace(place);
    setFormData({ 
       title: place.title || "", location: place.location || "", category: place.category || "Beach", 
       slug: place.slug || "", meta: place.meta_description || "", status: place.status || "Draft", 
       image: place.image || "", images: place.images || [], content: place.content || ""
    });
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const openAddModal = () => {
    setEditingPlace(null);
    setFormData({ title: "", location: "", category: "Beach", slug: "", meta: "", status: "Draft", image: "", images: [], content: "" });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    // Generate a default slug if empty
    const payload = { ...formData };
    if (!payload.slug || payload.slug === '/blog/') {
      payload.slug = `/blog/${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    }

    setIsSaving(true);
    try {
      if (editingPlace) {
        payload.id = editingPlace.id;
        const res = await fetch('/api/admin/blogs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updatedRecord = await res.json();
          setPlaces(places.map(p => p.id === editingPlace.id ? updatedRecord : p));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Failed to update article: ${errData.error || res.statusText}`);
        }
      } else {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newRecord = await res.json();
          setPlaces([newRecord, ...places]);
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Failed to create article: ${errData.error || res.statusText}`);
        }
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
    setIsModalOpen(false);
  };

  if (!isLoaded) return null;

  const currentItems = places.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-[100px] lg:pb-6 scroll-smooth">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight uppercase">Recommended Places & SEO Blog</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage website blog entries to boost organic traffic.</p>
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md bg-primary text-accent hover:bg-primary/95 transition-all">
            <Plus size={18} strokeWidth={3} /> Write Article
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search blogs by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary pl-11 pr-4 py-3 md:py-2 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Dashboard Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
           {currentItems.length > 0 ? currentItems.map((article, i) => (
             <div key={i} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group relative">
                
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md border ${article.status === 'Published' ? 'bg-green-500/90 text-white border-green-400' : 'bg-gray-800/80 text-white border-gray-600'}`}>
                      {article.status}
                   </span>
                   <div className="relative">
                     <button onClick={() => toggleDropdown(article.id)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary hover:bg-white shadow-sm border border-gray-200">
                        <MoreVertical size={14} />
                     </button>
                     {openDropdown === article.id && (
                       <div className="absolute right-0 top-10 mt-1 w-40 bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden z-20">
                          <button onClick={() => openEditModal(article)} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-2"><Edit2 size={12}/> Edit Article</button>
                          {(article.status === 'Draft') ? (
                            <button onClick={() => handleStatusChange(article.id, 'Published')} className="w-full text-left px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50 border-b border-gray-50 flex items-center gap-2"><Globe size={12}/> Publish Post</button>
                          ) : (
                            <button onClick={() => handleStatusChange(article.id, 'Draft')} className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 border-b border-gray-50 flex items-center gap-2"><EyeOff size={12}/> Unpublish</button>
                          )}
                          <button onClick={() => handleDelete(article.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12}/> Delete Article</button>
                       </div>
                     )}
                   </div>
                </div>

                <div className="h-48 bg-gray-100 relative group-hover:opacity-90 transition-opacity">
                   {article.image ? (
                     <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                       <Newspaper size={32} />
                       <span className="text-xs font-bold">No Cover Image</span>
                     </div>
                   )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="text-[10px] font-bold text-white bg-black px-2.5 py-1 rounded-md uppercase tracking-wider">{article.category}</span>
                     <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><MapPin size={12}/> {article.location}</span>
                   </div>
                   <h3 className="font-bold text-lg text-primary leading-tight mb-2 group-hover:text-amber-500 transition-colors line-clamp-2">{article.title}</h3>
                   <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-500">
                      <span className="font-mono bg-gray-50 px-2 py-1 rounded-md">{article.slug}</span>
                      <strong className="text-primary">{article.views} Views</strong>
                   </div>
                </div>
             </div>
           )) : (
             <div className="col-span-full text-center py-20 bg-white rounded-[24px] border border-gray-100">
                <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-primary mb-1">No articles found</h3>
                <p className="text-sm font-medium text-gray-500">Publish your first SEO article to drive traffic!</p>
             </div>
           )}
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden z-10 animate-scaleIn max-h-[90vh] flex flex-col">
             
             {/* Modal Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                   <h3 className="text-xl font-extrabold text-primary">{editingPlace ? "Edit Article" : "Write SEO Article"}</h3>
                   <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{editingPlace ? editingPlace.id : 'NEW ARTICLE'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
                  <X size={18} />
                </button>
             </div>
             
             {/* Modal Body */}
             <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="w-40 shrink-0 flex flex-col gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Cover Image</label>
                       <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                          {formData.image ? (
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <Camera size={24} />
                             </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                       </div>
                     </div>
                     
                     <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Gallery Upload</label>
                       <div className="grid grid-cols-2 gap-2">
                          {(formData.images || []).map((img, idx) => (
                             <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
                                <img src={img} className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setFormData(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} 
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={10} />
                                </button>
                             </div>
                          ))}
                          <div className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary hover:bg-gray-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative">
                             <Plus size={16} className="text-gray-400" />
                             <span className="text-[9px] font-bold text-gray-400 uppercase">Add</span>
                             <input type="file" multiple accept="image/*" onChange={handleAdditionalImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                       </div>
                     </div>
                   </div>

                   <div className="flex-1 space-y-4">
                      <div>
                         <div className="flex justify-between items-end mb-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Article Title (H1)</label>
                         </div>
                         <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white text-lg font-extrabold text-primary rounded-xl px-4 py-3 border border-gray-200 outline-none focus:border-accent shadow-sm" placeholder="10 Hidden Beaches..." />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Target Location</label>
                           <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="e.g. Uluwatu, Bali" />
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
                           <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 text-sm font-bold text-primary rounded-xl px-4 py-2 border border-gray-200 outline-none focus:border-accent h-[38px]">
                              <option value="Beach">Beach</option>
                              <option value="Nature">Nature</option>
                              <option value="Nightlife">Nightlife</option>
                              <option value="Culture">Culture</option>
                              <option value="Dining">Dining</option>
                           </select>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                   <h4 className="text-sm font-extrabold text-primary mb-4 flex items-center gap-2"><Newspaper size={16} className="text-amber-500" /> Article Content</h4>
                   
                   <div className="w-full h-[300px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col mb-6">
                      {/* Rich Text Editor Toolbar Mock */}
                      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2 shrink-0">
                         <button type="button" onClick={() => insertFormat('<strong>', '</strong>')} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 font-bold text-sm text-gray-600">B</button>
                         <button type="button" onClick={() => insertFormat('<em>', '</em>')} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 font-serif italic text-sm text-gray-600">I</button>
                         <button type="button" onClick={() => insertFormat('<u>', '</u>')} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 underline text-sm text-gray-600">U</button>
                         <div className="w-px h-4 bg-gray-300 mx-1"></div>
                         <button type="button" onClick={() => insertFormat('<h2>', '</h2>')} className="h-6 px-2 rounded flex items-center justify-center hover:bg-gray-200 font-bold text-xs text-gray-600">H1</button>
                         <button type="button" onClick={() => insertFormat('<h3>', '</h3>')} className="h-6 px-2 rounded flex items-center justify-center hover:bg-gray-200 font-bold text-xs text-gray-600">H2</button>
                         <button type="button" onClick={() => insertFormat('<h4>', '</h4>')} className="h-6 px-2 rounded flex items-center justify-center hover:bg-gray-200 font-bold text-xs text-gray-600">H3</button>
                         <div className="w-px h-4 bg-gray-300 mx-1"></div>
                         <button type="button" onClick={() => {
                            const url = prompt("Enter image URL:");
                            if(url) insertFormat(`<img src="${url}" alt="Image" class="w-full rounded-2xl my-4" />`);
                         }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600"><ImageIcon size={14}/></button>
                      </div>
                      
                      <textarea 
                         ref={textareaRef}
                         className="flex-1 w-full p-4 resize-none outline-none text-[13px] text-gray-700 font-medium leading-relaxed font-sans placeholder:text-gray-400 focus:bg-[#FAFAFA]"
                         placeholder="Write your article body here... Select text and use the toolbar to format."
                         value={formData.content || ''}
                         onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                      ></textarea>
                   </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                   <h4 className="text-sm font-extrabold text-primary mb-4 flex items-center gap-2"><Globe size={16} className="text-blue-500" /> SEO Configuration</h4>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">URL Slug</label>
                         <div className="flex items-center">
                            <span className="bg-gray-100 border border-r-0 border-gray-200 text-gray-500 text-sm font-semibold px-3 py-2 rounded-l-xl">/blog/</span>
                            <input type="text" value={formData.slug.replace('/blog/', '')} onChange={(e) => setFormData({...formData, slug: '/blog/' + e.target.value})} className="flex-1 bg-white text-sm font-bold text-primary rounded-r-xl px-3 py-2 border border-gray-200 outline-none focus:border-accent" placeholder="my-awesome-post" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Meta Description</label>
                         <textarea rows="2" value={formData.meta} onChange={(e) => setFormData({...formData, meta: e.target.value})} className="w-full bg-gray-50 text-sm font-medium text-gray-600 rounded-xl p-3 border border-gray-200 outline-none focus:border-accent" placeholder="A brief summary for Google Search Snippets..."></textarea>
                      </div>
                   </div>
                </div>

             </div>

             {/* Modal Footer */}
             <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Status</label>
                 <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="bg-white text-sm font-bold text-primary rounded-lg px-3 py-1.5 border border-gray-200 outline-none focus:border-accent">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                 </select>
               </div>
               <div className="flex gap-3 text-right">
                 <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-6 py-2 bg-white text-gray-600 font-bold border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                 <button onClick={handleSaveModal} disabled={isSaving} className="px-6 py-2 bg-primary text-white font-bold shadow-md rounded-xl hover:bg-primary/95 transition-colors disabled:opacity-70 flex items-center gap-2">
                   {isSaving ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Saving...</span>
                     </>
                   ) : (
                     <span>Save Article</span>
                   )}
                 </button>
               </div>
             </div>

          </div>
        </div>
      )}
    </div>
  );
}
