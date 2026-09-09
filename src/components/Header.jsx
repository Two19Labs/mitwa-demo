import React from 'react';
import { Mic, Radio, Volume2, VolumeX, Sparkles, MapPin, ChevronDown, Presentation, TrendingUp } from 'lucide-react';
import { VENUES } from '../services/dialogEngine';

export default function Header({ 
  currentVenue, 
  onSelectVenue, 
  isMuted, 
  onToggleMute, 
  isCallActive,
  onOpenPitchModal 
}) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-cyan-300 p-0.5 shadow-lg shadow-cyan-500/25">
            <div className="w-full h-full bg-mitwa-950 rounded-[14px] flex items-center justify-center">
              <Mic className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
            </div>
            {isCallActive && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                MITWA
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Voice AI
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span>"Your AI Front Desk"</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">for Booking-Led Businesses in India</span>
            </p>
          </div>
        </div>

        {/* Venue Selector, Pitch Guide & Audio Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Restaurant Venue Selector */}
          <div className="relative">
            <select
              value={currentVenue.id}
              onChange={(e) => onSelectVenue(VENUES[e.target.value])}
              className="appearance-none bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-200 pl-8 pr-7 py-2 rounded-xl focus:outline-none focus:border-cyan-400 transition cursor-pointer"
            >
              <option value="bukhara">Bukhara Grill & Lounge (Bangalore)</option>
              <option value="punjab_grill">Punjab Grill & Bar (Gurgaon)</option>
              <option value="opedro">O Pedro Coastal Kitchen (Mumbai)</option>
            </select>
            <MapPin className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* ROI Metric Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>₹48.5K Saved Today</span>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span className="hidden sm:inline">Voice Agent Active</span>
            <span className="sm:hidden">Active</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              isMuted 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden md:inline text-[11px] font-medium">{isMuted ? 'Muted' : 'Voice On'}</span>
          </button>

          {/* Pitch Companion Button */}
          <button
            onClick={onOpenPitchModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
          >
            <Presentation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pitch Guide</span>
          </button>
        </div>

      </div>
    </header>
  );
}
