import React from 'react';
import { MessageSquare, CheckCheck, X, Calendar, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export default function WhatsAppPreview({ payload, onClose }) {
  if (!payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0b141a] border border-[#202c33] shadow-2xl overflow-hidden font-sans">
        
        {/* Smartphone Status Bar simulation */}
        <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* WhatsApp Chat Header */}
        <div className="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-100">{payload.venueName}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Official Business Account</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body (WhatsApp Wallpaper aesthetic) */}
        <div className="p-4 min-h-[340px] bg-[#0b141a] flex flex-col justify-between">
          
          {/* Timestamp chip */}
          <div className="flex justify-center mb-3">
            <span className="text-[10px] text-slate-400 bg-[#182229] px-2.5 py-0.5 rounded-md uppercase font-semibold">
              Today
            </span>
          </div>

          {/* Incoming Message Bubble from Restaurant */}
          <div className="self-start max-w-[92%] rounded-2xl rounded-tl-none bg-[#202c33] text-slate-100 p-3.5 shadow-md border border-[#2a3942]/60">
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mitwa Instant Notification</span>
            </div>

            <div className="text-xs space-y-1.5 leading-relaxed text-slate-200 whitespace-pre-line font-normal">
              {payload.messageText}
            </div>

            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
              <span>{payload.timestamp}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>

          {/* Quick Action Interactive Buttons */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sent automatically via Mitwa Voice Agent</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5"
            >
              <span>Back to Demo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
