import React from 'react';
import { 
  X, Play, Sparkles, TrendingUp, PhoneCall, CheckCircle2, 
  MessageSquare, Zap, Target, DollarSign, Award 
} from 'lucide-react';

export default function PitchModal({ isOpen, onClose, onRunAutoDemo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                MITWA Pitch Companion
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Investor Demo
                </span>
              </h2>
              <p className="text-xs text-slate-400">Your AI Front Desk for Booking-Led Businesses in India</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Interactive Demo Button for Presenter */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-mitwa-900 to-teal-950/60 border border-cyan-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>1-Click Live Pitch Script (Auto-Run)</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Presenting in a noisy room or want zero-risk live execution? This triggers the full 3-step conversation (8 PM unavailable check + 7:30 PM acceptance + instant live dashboard sync).
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onRunAutoDemo) onRunAutoDemo();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-mitwa-950 font-extrabold text-xs tracking-wide uppercase transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-mitwa-950" />
            <span>Run Auto Demo</span>
          </button>
        </div>

        {/* Pitch Deck Core Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
          {/* Card 1: Problem */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/20">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase mb-1.5">
              <Target className="w-3.5 h-3.5" /> The Problem
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">60%+ of calls</strong> go unanswered during 8–10 PM dinner rush. Restaurants lose over <strong className="text-rose-300">₹1.5 Lakhs/month</strong> in lost bookings.
            </p>
          </div>

          {/* Card 2: Solution */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> The Mitwa Solution
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Picks up in <strong className="text-white">&lt; 1 second</strong>, speaks Hindi, Hinglish & English, enforces real table availability, and auto-syncs to POS.
            </p>
          </div>

          {/* Card 3: Business Model */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase mb-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Business Model
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              B2B SaaS: <strong className="text-white">₹4,999/month</strong> per outlet. 10x cheaper than human receptionists with 100% call coverage.
            </p>
          </div>
        </div>

        {/* 30-Second Demo Cheat Sheet */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2.5">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            30-Second Demo Script for Presenter
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
              <p>Say: <strong className="text-white italic">"Bhai aaj raat 8 baje 4 logon ke liye table chahiye."</strong> Notice Mitwa politely flags 8:00 PM as booked out and offers 7:30 PM or 8:30 PM.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
              <p>Say: <strong className="text-white italic">"7:30 PM theek rahega, book kar do."</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
              <p>Say: <strong className="text-white italic">"Rahul Sharma, 9876543210."</strong> Watch the booking confirmed aloud and immediately appear in the live dashboard with a WhatsApp notification!</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Pitch Guide
          </button>
        </div>

      </div>
    </div>
  );
}
