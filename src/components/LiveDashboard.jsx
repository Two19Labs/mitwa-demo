import React, { useState } from 'react';
import { 
  Users, CheckCircle2, PhoneCall, UtensilsCrossed, Clock, 
  Search, Filter, Sparkles, Check, X, ShieldAlert, ArrowUpRight, RotateCcw,
  IndianRupee, LayoutGrid, Table, MessageSquare, ExternalLink
} from 'lucide-react';
import FloorPlanView from './FloorPlanView';
import WhatsAppPreview from './WhatsAppPreview';
import { generateWhatsAppPayload, RESTAURANT_INFO } from '../services/dialogEngine';

export default function LiveDashboard({ 
  currentVenue = RESTAURANT_INFO,
  bookings, 
  callsCount, 
  onUpdateStatus, 
  onResetBookings,
  newBookingId 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dashboardView, setDashboardView] = useState('table'); // 'table' | 'floor'
  const [selectedWhatsAppPayload, setSelectedWhatsAppPayload] = useState(null);

  // Metrics computation
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Seated').length;
  const totalTablesCapacity = 14;
  const availableTables = Math.max(0, totalTablesCapacity - confirmedCount);
  
  // Financial ROI calculation for Pitch
  const avgTicket = currentVenue.avgTicketSize || 2500;
  const estimatedRevenue = confirmedCount * avgTicket;

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.phone && booking.phone.includes(searchQuery)) ||
      booking.time.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && booking.status.toUpperCase() === filterStatus;
  });

  const handleOpenWhatsAppForBooking = (b) => {
    const payload = generateWhatsAppPayload(b, currentVenue);
    setSelectedWhatsAppPayload(payload);
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* WhatsApp Modal */}
      {selectedWhatsAppPayload && (
        <WhatsAppPreview
          payload={selectedWhatsAppPayload}
          onClose={() => setSelectedWhatsAppPayload(null)}
        />
      )}

      {/* Top Metrics Cards - 4 Column Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Calls Today */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Calls Today
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {callsCount}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Inbound AI calls</p>
        </div>

        {/* Bookings Confirmed */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Confirmed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {confirmedCount}
            </span>
            <span className="text-[10px] text-cyan-300 font-medium">Tables</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">100% via Mitwa</p>
        </div>

        {/* Available Tables */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-teal-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-teal-300 tracking-tight">
              {availableTables}
            </span>
            <span className="text-[10px] text-slate-400">/ {totalTablesCapacity}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Floor capacity</p>
        </div>

        {/* Estimated Revenue Generated */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Est. Revenue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-black text-amber-300 tracking-tight">
              ₹{(estimatedRevenue / 1000).toFixed(1)}k
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Saved from missed calls</p>
        </div>
      </div>

      {/* Real-time Slots Availability Status Bar */}
      <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Slot Availability ({currentVenue.city})</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Rules automatically enforced by Mitwa
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <span className="text-xs font-semibold text-white">7:00 PM</span>
            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">Open</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <span className="text-xs font-semibold text-white">7:30 PM</span>
            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">Open</span>
          </div>

          {/* 8:00 PM (SOLD OUT) */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/50 ring-1 ring-rose-500/30">
            <span className="text-xs font-semibold text-rose-200">8:00 PM</span>
            <span className="text-[10px] font-bold text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/20 flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" /> Booked
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <span className="text-xs font-semibold text-white">8:30 PM</span>
            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">Open</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <span className="text-xs font-semibold text-white">9:00 PM</span>
            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">Open</span>
          </div>
        </div>
      </div>

      {/* Main Container: Bookings Table or Floor Plan */}
      <div className="glass-panel rounded-3xl border border-white/5 p-4 sm:p-5 flex-1 flex flex-col">
        {/* Table Header, View Switcher & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                TODAY'S BOOKINGS
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {bookings.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates when Mitwa confirms reservations via voice
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Table vs Floor Plan */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setDashboardView('table')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  dashboardView === 'table' 
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setDashboardView('floor')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  dashboardView === 'floor' 
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Floor Plan</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest..."
                className="w-28 sm:w-36 bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetBookings}
              title="Reset to default demo bookings"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs (Only shown in Table View) */}
        {dashboardView === 'table' && (
          <div className="flex items-center gap-1.5 my-3">
            {['ALL', 'CONFIRMED', 'SEATED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterStatus === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/40 border border-transparent'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* View 1: Floor Plan View */}
        {dashboardView === 'floor' ? (
          <div className="mt-3 flex-1">
            <FloorPlanView bookings={bookings} />
          </div>
        ) : (
          /* View 2: Table View */
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-semibold">Customer Name</th>
                  <th className="py-2.5 px-3 font-semibold">Guests</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Time</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No reservations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isJustAdded = b.id === newBookingId;
                    return (
                      <tr
                        key={b.id}
                        className={`transition-colors group hover:bg-white/[0.02] ${
                          isJustAdded ? 'animate-new-row' : ''
                        }`}
                      >
                        {/* Customer Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs">
                              {b.name ? b.name.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{b.name}</span>
                                {isJustAdded && (
                                  <span className="text-[9px] font-extrabold bg-cyan-400 text-mitwa-950 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {b.phone ? `+91 ${b.phone}` : 'Voice booking'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Guests */}
                        <td className="py-3 px-3 font-medium text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{b.guests} Guests</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-slate-300">
                          <span className="font-medium">{b.date}</span>
                        </td>

                        {/* Time */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-semibold text-xs">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {b.time}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : b.status === 'Seated'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-400'
                                  : b.status === 'Seated'
                                    ? 'bg-cyan-400'
                                    : 'bg-rose-400'
                              }`}
                            />
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleOpenWhatsAppForBooking(b)}
                              title="View WhatsApp confirmation delivered to customer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            {b.status === 'Confirmed' && (
                              <button
                                onClick={() => onUpdateStatus(b.id, 'Seated')}
                                title="Mark guest as seated"
                                className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium transition"
                              >
                                Seat
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => onUpdateStatus(b.id, 'Cancelled')}
                                title="Cancel reservation"
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-medium transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Real-time voice sync active • {currentVenue.name}</span>
          <span>Source: Mitwa AI Front Desk</span>
        </div>
      </div>
    </div>
  );
}
