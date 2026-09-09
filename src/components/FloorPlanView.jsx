import React from 'react';
import { Users, Clock, Sparkles } from 'lucide-react';

export default function FloorPlanView({ bookings }) {
  // Generate 12 interactive tables
  const tables = [
    { id: 'T-1', name: 'T-1 (Patio)', capacity: 2, zone: 'Patio' },
    { id: 'T-2', name: 'T-2 (Patio)', capacity: 4, zone: 'Patio' },
    { id: 'T-3', name: 'T-3 (Window)', capacity: 2, zone: 'Main Hall' },
    { id: 'T-4', name: 'T-4 (Booth)', capacity: 4, zone: 'Main Hall' },
    { id: 'T-5', name: 'T-5 (Center)', capacity: 6, zone: 'Main Hall' },
    { id: 'T-6', name: 'T-6 (Center)', capacity: 4, zone: 'Main Hall' },
    { id: 'T-7', name: 'T-7 (Lounge)', capacity: 8, zone: 'VIP Lounge' },
    { id: 'T-8', name: 'T-8 (Lounge)', capacity: 6, zone: 'VIP Lounge' },
    { id: 'T-9', name: 'T-9 (Booth)', capacity: 4, zone: 'Main Hall' },
    { id: 'T-10', name: 'T-10 (Corner)', capacity: 2, zone: 'Main Hall' },
    { id: 'T-11', name: 'T-11 (Family)', capacity: 8, zone: 'Private Area' },
    { id: 'T-12', name: 'T-12 (Executive)', capacity: 4, zone: 'Private Area' }
  ];

  // Map confirmed bookings to tables
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Seated');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span>Mitwa Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Seated</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500">Auto-allocated by Mitwa Voice AI</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((table, idx) => {
          // Check if a booking is assigned to this table or match by index
          const assignedBooking = confirmedBookings[idx] || null;
          const isReserved = Boolean(assignedBooking);
          const isSeated = assignedBooking?.status === 'Seated';

          return (
            <div
              key={table.id}
              className={`p-3 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isSeated
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                  : isReserved
                    ? 'bg-cyan-950/50 border-cyan-400/40 shadow-md shadow-cyan-500/10 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {/* Table Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white tracking-wide">{table.name}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Users className="w-3 h-3 text-cyan-400" /> {table.capacity}
                </span>
              </div>

              {/* Status & Guest info */}
              {isReserved ? (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white truncate max-w-[100px]">
                      {assignedBooking.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                      {assignedBooking.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{assignedBooking.guests} guests</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Vacant</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
