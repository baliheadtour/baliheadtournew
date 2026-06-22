"use client";

import React, { useState } from "react";
import { X, Star, Trash2, MessageSquare, AlertCircle } from "lucide-react";

export default function ReviewModal({ item, onClose }) {
  const [reviews, setReviews] = useState(item.reviewsList || []);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (reviewId) => {
    if (isDeleting) return;
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setIsDeleting(reviewId);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: item.id, reviewId })
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center font-sans">
      
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-gray-50 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-transform animate-slideUp sm:animate-scaleIn z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
           <div>
             <h2 className="text-xl font-extrabold text-primary tracking-tight">Review Moderation</h2>
             <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide line-clamp-1">{item.title}</p>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
               >
                <X size={16} strokeWidth={3} />
              </button>
           </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth space-y-4">
           {reviews.length === 0 ? (
              <div className="text-center py-12">
                 <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="font-bold text-primary">No Active Reviews</h3>
                 <p className="text-sm font-medium text-gray-500">There are no reviews left to moderate.</p>
              </div>
           ) : (
             reviews.map(review => (
               <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition-all">
                  
                  {/* Avatar Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                     {review.user.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <div>
                         <h4 className="font-extrabold text-sm text-primary">{review.user}</h4>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.date).toLocaleDateString()}</span>
                       </div>
                       
                       {/* Rating Stars */}
                       <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? "fill-accent text-accent" : "fill-gray-100 text-gray-200"} 
                            />
                          ))}
                       </div>
                    </div>

                    <p className="text-sm font-medium text-gray-600 mt-2 leading-relaxed">
                       {review.comment}
                    </p>

                    {review.rating <= 2 && (
                       <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 inline-block px-2 py-1 rounded-md">
                         <AlertCircle size={12} /> Low Rating Warning
                       </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-start">
                     <button 
                       onClick={() => handleDelete(review.id)}
                       title="Remove Review"
                       disabled={isDeleting === review.id}
                       className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors disabled:opacity-50"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex items-center justify-end pb-safe">
           <button 
             onClick={onClose}
             className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
           >
             Close Modertion
           </button>
        </div>
      </div>
    </div>
  );
}
