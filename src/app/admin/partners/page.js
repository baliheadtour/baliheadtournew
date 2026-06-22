"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Briefcase, MoreVertical, Trash2, Edit2, CheckCircle2, FileWarning, Store, X, Mail, Phone, Calendar } from "lucide-react";

export default function PartnersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [partners, setPartners] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null); // Tap-to-expand modal state
  
  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "Scooter Rental", contact: "", email: "" });

  const initialPartners = [
    { id: "PRT-001", name: "THE BIKE RENTAL BALI", type: "Scooter Rental", email: "contact@thebikebali.com", contact: "+6282247819449", joined: "Jan 10, 2026", status: "Verified", listings: 12 },
    { id: "PRT-002", name: "B&G UBUD RENT MOTOR", type: "Scooter Rental", email: "info@bgubud.com", contact: "+6281246889611", joined: "Feb 01, 2026", status: "Verified", listings: 8 },
    { id: "PRT-003", name: "Ubud Tranquility Spa", type: "Spa Center", email: "booking@tranquility.com", contact: "+6281995373455", joined: "Feb 15, 2026", status: "Verified", listings: 4 },
    { id: "PRT-004", name: "Bali Fast Drivers", type: "Transport", email: "admin@balifast.com", contact: "+628111222334", joined: "Mar 05, 2026", status: "Pending Audit", listings: 0 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("bali_partners");
    if (saved) {
      setPartners(JSON.parse(saved));
    } else {
      setPartners(initialPartners);
      localStorage.setItem("bali_partners", JSON.stringify(initialPartners));
    }
    setIsLoaded(true);
  }, []);

  const savePartners = (newData) => {
    setPartners(newData);
    localStorage.setItem("bali_partners", JSON.stringify(newData));
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = partners.map(p => p.id === id ? { ...p, status: newStatus } : p);
    savePartners(updated);
    setOpenDropdown(null);
    if (selectedPartner && selectedPartner.id === id) {
       setSelectedPartner({ ...selectedPartner, status: newStatus });
    }
  };

  const handleDelete = (id) => {
    if (confirm("Permanently remove this partner from the ecosystem?")) {
      const updated = partners.filter(p => p.id !== id);
      savePartners(updated);
      setSelectedPartner(null);
    }
    setOpenDropdown(null);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, type: partner.type, contact: partner.contact, email: partner.email });
    setIsModalOpen(true);
    setOpenDropdown(null);
    setSelectedPartner(null);
  };

  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({ name: "", type: "Scooter Rental", contact: "", email: "" });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (editingPartner) {
      const updated = partners.map(p => p.id === editingPartner.id ? { ...p, ...formData } : p);
      savePartners(updated);
    } else {
      const newPartner = {
        id: `PRT-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name || "New Partner Co.",
        type: formData.type,
        email: formData.email,
        contact: formData.contact,
        joined: "Just Now",
        status: "Pending Audit",
        listings: 0
      };
      savePartners([newPartner, ...partners]);
    }
    setIsModalOpen(false);
  };

  if (!isLoaded) return null;

  const currentItems = partners.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto scroll-smooth">
      <div className="space-y-8 pb-24">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Partner Ecosystem</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage agencies, local providers, and their contracts.</p>
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold shadow-[0_4px_20px_rgba(217,251,65,0.15)] bg-[#D9FB41] text-[#1C1C1E] hover:bg-[#C5E838] transition-all active:scale-95">
            <Plus size={18} strokeWidth={2.5} /> Onboard Partner
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-2.5 rounded-3xl border border-[#E8EAEF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search partners by name, type, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1C1C1E] pl-11 pr-4 py-3 md:py-2 outline-none placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-[#E8EAEF] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden mt-4">
          <div className="overflow-x-hidden">
            <table className="w-full text-left border-collapse cursor-pointer">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E8EAEF]">
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4">Agency Name</th>
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4 hidden sm:table-cell">Category</th>
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4 hidden lg:table-cell">Network Contact</th>
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4 hidden md:table-cell">Auth Status</th>
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4 text-right">Active Listings</th>
                  <th className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-6 py-4 text-right hidden lg:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAEF]">
                {currentItems.length > 0 ? currentItems.map((partner, i) => (
                  <tr key={i} onClick={() => setSelectedPartner(partner)} className="hover:bg-[#F8F9FA] active:bg-gray-100 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#F8F9FA] border border-[#E8EAEF] text-[#1C1C1E] flex items-center justify-center shrink-0 group-hover:bg-[#1C1C1E] group-hover:text-[#D9FB41] transition-colors">
                            <Store size={20} strokeWidth={2} />
                         </div>
                         <div>
                           <p className="text-sm font-extrabold text-[#1C1C1E]">{partner.name}</p>
                           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{partner.id}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                       <span className="bg-[#F8F9FA] px-3 py-1.5 rounded-xl border border-[#E8EAEF] text-[10px] font-black uppercase tracking-widest text-[#1C1C1E]">{partner.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                       <p className="text-sm font-bold text-[#1C1C1E]">{partner.email}</p>
                       <p className="text-[11px] text-gray-400 font-bold mt-0.5">{partner.contact}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest
                        ${partner.status === 'Verified' ? 'bg-[#D9FB41]/20 text-[#1C1C1E]' : 'bg-amber-50 text-amber-600'}
                      `}>
                        {partner.status === 'Verified' && <CheckCircle2 size={12} />}
                        {partner.status === 'Pending Audit' && <FileWarning size={12} />}
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#1C1C1E] text-right">{partner.listings} Services</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative hidden lg:table-cell">
                       <button onClick={(e) => toggleDropdown(e, partner.id)} className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent text-gray-400 hover:bg-gray-100 hover:text-[#1C1C1E] ml-auto focus:outline-none transition-colors">
                         <MoreVertical size={16} />
                       </button>
                       {openDropdown === partner.id && (
                         <div className="absolute right-6 top-10 mt-1 w-48 bg-white shadow-2xl border border-[#E8EAEF] rounded-2xl overflow-hidden z-20">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(partner); }} className="w-full text-left px-5 py-3 text-xs font-bold text-[#1C1C1E] hover:bg-[#F8F9FA] border-b border-[#E8EAEF] flex items-center gap-2"><Edit2 size={14}/> Edit Details</button>
                            {(partner.status === 'Pending Audit') ? (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(partner.id, 'Verified'); }} className="w-full text-left px-5 py-3 text-xs font-bold text-green-600 hover:bg-[#F8F9FA] border-b border-[#E8EAEF] flex items-center gap-2"><CheckCircle2 size={14}/> Validate Auth</button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(partner.id, 'Pending Audit'); }} className="w-full text-left px-5 py-3 text-xs font-bold text-amber-600 hover:bg-[#F8F9FA] border-b border-[#E8EAEF] flex items-center gap-2"><FileWarning size={14}/> Revoke Validity</button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(partner.id); }} className="w-full text-left px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Offboard Partner</button>
                         </div>
                       )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan="6">
                       <div className="text-center py-24 bg-white rounded-b-3xl">
                          <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <Briefcase size={24} className="text-gray-300" />
                          </div>
                          <h3 className="text-lg font-black text-[#1C1C1E] mb-1">No partners onboarded</h3>
                          <p className="text-sm font-medium text-gray-400">Try adjusting your active filters.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Tap-to-Expand Mobile Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pt-20 px-4 pb-4">
           <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPartner(null)} />
           <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 z-10 animate-slideUp sm:animate-scaleIn overflow-y-auto max-h-[85vh]">
             <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                   <div className="w-14 h-14 rounded-2xl bg-[#D9FB41] flex items-center justify-center text-[#1C1C1E] shrink-0">
                      <Store size={28} strokeWidth={2.5} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-[#1C1C1E]">{selectedPartner.name}</h3>
                     <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">{selectedPartner.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedPartner(null)} className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#1C1C1E] hover:bg-gray-200 transition-colors">
                  <X size={18} strokeWidth={2.5} />
                </button>
             </div>
             
             <div className="space-y-5 mb-8 border-y border-[#E8EAEF] py-6">
                <div className="flex justify-between bg-[#F8F9FA] p-4 rounded-2xl">
                   <div>
                     <p className="text-[10px] font-extrabold text-[#1C1C1E] uppercase tracking-widest mb-1">Category Type</p>
                     <p className="text-sm font-black text-[#1C1C1E]">{selectedPartner.type}</p>
                   </div>
                   <div className="text-right border-l border-[#E8EAEF] pl-4">
                     <p className="text-[10px] font-extrabold text-[#1C1C1E] uppercase tracking-widest mb-1">Active Listings</p>
                     <p className="text-sm font-black text-[#1C1C1E]">{selectedPartner.listings}</p>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Mail size={12}/> Email Address</p>
                   <p className="text-[15px] font-bold text-[#1C1C1E] underline decoration-gray-300">{selectedPartner.email}</p>
                </div>
                <div>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Phone size={12}/> Phone Number</p>
                   <p className="text-[15px] font-bold text-[#1C1C1E] underline decoration-gray-300">{selectedPartner.contact}</p>
                </div>
             </div>

             <div className="space-y-3">
               <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Management Actions</p>

               <div className="grid grid-cols-2 gap-3 mb-4">
                  <span className={`col-span-2 inline-flex items-center justify-center py-2.5 rounded-xl text-sm font-black uppercase tracking-widest border
                    ${selectedPartner.status === 'Verified' ? 'bg-[#D9FB41]/10 text-green-700 border-[#D9FB41]' : 'bg-amber-50 text-amber-600 border-amber-200'}
                  `}>
                      Current Status: {selectedPartner.status}
                  </span>
               </div>
               
               <button onClick={() => openEditModal(selectedPartner)} className="w-full py-3.5 bg-[#D9FB41] text-[#1C1C1E] font-black rounded-xl hover:bg-[#C5E838] transition-colors shadow-sm mb-2">Edit Setup</button>

               {(selectedPartner.status === 'Pending Audit') ? (
                  <button onClick={() => handleStatusChange(selectedPartner.id, 'Verified')} className="w-full py-3.5 bg-[#1C1C1E] text-white font-black rounded-xl hover:bg-black transition-colors shadow-sm">Verify Agency Status</button>
               ) : (
                  <button onClick={() => handleStatusChange(selectedPartner.id, 'Pending Audit')} className="w-full py-3 bg-white border border-[#E8EAEF] text-[#1C1C1E] font-extrabold rounded-xl hover:bg-gray-50 transition-colors">Revoke Validity</button>
               )}
               <button onClick={() => handleDelete(selectedPartner.id)} className="w-full py-3 bg-red-50 border border-red-100 text-red-500 font-extrabold rounded-xl hover:bg-red-100 transition-colors mt-4">Offboard Agency</button>

             </div>
           </div>
        </div>
      )}

      {/* Edit/Add Modal Native Styled */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center font-sans px-4">
          <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 md:p-8 z-10 animate-scaleIn">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-[#1C1C1E]">{editingPartner ? "Edit Partner" : "Onboard Partner"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-[#F8F9FA] p-2 rounded-full text-[#1C1C1E] hover:bg-gray-200">
                  <X size={18} strokeWidth={2.5} />
                </button>
             </div>
             
             <div className="space-y-5">
                <div>
                   <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Agency Name</label>
                   <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F8F9FA] text-sm font-bold text-[#1C1C1E] rounded-2xl px-5 py-4 border border-[#E8EAEF] outline-none focus:border-[#1C1C1E] transition-colors" placeholder="e.g. Bali Transports" />
                </div>
                <div>
                   <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Service Category</label>
                   <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-[#F8F9FA] text-sm font-bold text-[#1C1C1E] rounded-2xl px-5 py-4 border border-[#E8EAEF] outline-none focus:border-[#1C1C1E] h-[52px]">
                      <option value="Tour Operator">Tour Operator</option>
                      <option value="Spa Center">Spa Center</option>
                      <option value="Scooter Rental">Scooter Rental</option>
                      <option value="Transport Company">Transport Company</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Company Email</label>
                   <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8F9FA] text-sm font-bold text-[#1C1C1E] rounded-2xl px-5 py-4 border border-[#E8EAEF] outline-none focus:border-[#1C1C1E] transition-colors" placeholder="admin@company.com" />
                </div>
                <div>
                   <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Emergency Contact</label>
                   <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full bg-[#F8F9FA] text-sm font-bold text-[#1C1C1E] rounded-2xl px-5 py-4 border border-[#E8EAEF] outline-none focus:border-[#1C1C1E] transition-colors" placeholder="+62..." />
                </div>
             </div>

             <div className="mt-8 flex gap-3">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-[#E8EAEF] text-[#1C1C1E] font-extrabold rounded-2xl hover:bg-gray-50 transition-colors">Cancel</button>
               <button onClick={handleSaveModal} className="flex-1 py-4 bg-[#D9FB41] text-[#1C1C1E] font-black rounded-2xl hover:bg-[#C5E838] transition-colors">Save Details</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
