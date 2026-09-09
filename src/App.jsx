import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VoiceAgent from './components/VoiceAgent';
import LiveDashboard from './components/LiveDashboard';
import PitchModal from './components/PitchModal';
import { speechService } from './services/speechService';
import { VENUES, RESTAURANT_INFO } from './services/dialogEngine';
import { Info, Sparkles, CheckCircle, ShieldCheck, Presentation } from 'lucide-react';

const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'MITWA-1042',
    name: 'Aarav Mehta',
    guests: 3,
    date: 'Today',
    time: '7:00 PM',
    phone: '9820145672',
    status: 'Confirmed',
    createdAt: '09:45 AM',
    source: 'Mitwa Voice Agent',
    tableNumber: 'T-3',
    whatsAppSent: true
  },
  {
    id: 'MITWA-1038',
    name: 'Ananya Deshmukh',
    guests: 2,
    date: 'Today',
    time: '7:30 PM',
    phone: '9845012389',
    status: 'Confirmed',
    createdAt: '09:12 AM',
    source: 'Mitwa Voice Agent',
    tableNumber: 'T-1',
    whatsAppSent: true
  },
  {
    id: 'MITWA-1031',
    name: 'Kabir Singhania',
    guests: 6,
    date: 'Today',
    time: '8:30 PM',
    phone: '9988776655',
    status: 'Confirmed',
    createdAt: '08:30 AM',
    source: 'Mitwa Voice Agent',
    tableNumber: 'T-5',
    whatsAppSent: true
  },
  {
    id: 'MITWA-1025',
    name: 'Rohan & Friends',
    guests: 4,
    date: 'Today',
    time: '9:00 PM',
    phone: '9711223344',
    status: 'Confirmed',
    createdAt: 'Yesterday',
    source: 'Mitwa Voice Agent',
    tableNumber: 'T-4',
    whatsAppSent: true
  }
];

export default function App() {
  const [currentVenue, setCurrentVenue] = useState(VENUES.bukhara);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const autoDemoRunnerRef = useRef(null);

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('mitwa_bookings_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return INITIAL_DEMO_BOOKINGS;
  });

  const [callsCount, setCallsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('mitwa_calls_count_v2');
      if (saved) return parseInt(saved, 10);
    } catch (e) {
      // ignore
    }
    return 24;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [newBookingId, setNewBookingId] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mitwa_bookings_v2', JSON.stringify(bookings));
    } catch (e) {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('mitwa_calls_count_v2', callsCount.toString());
    } catch (e) {
      // ignore
    }
  }, [callsCount]);

  const handleBookingConfirmed = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    setNewBookingId(newBooking.id);

    // Remove animation highlight after 4s
    setTimeout(() => {
      setNewBookingId(null);
    }, 4000);
  };

  const handleCallIncrement = () => {
    setCallsCount(prev => prev + 1);
  };

  const handleUpdateStatus = (bookingId, newStatus) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const handleResetBookings = () => {
    setBookings(INITIAL_DEMO_BOOKINGS);
    setCallsCount(24);
    localStorage.removeItem('mitwa_bookings_v2');
    localStorage.removeItem('mitwa_calls_count_v2');
  };

  const handleToggleMute = () => {
    const muted = speechService.toggleMute();
    setIsMuted(muted);
  };

  const registerAutoDemo = (fn) => {
    autoDemoRunnerRef.current = fn;
  };

  const triggerAutoDemo = () => {
    if (autoDemoRunnerRef.current) {
      autoDemoRunnerRef.current();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mitwa-950 text-slate-100 selection:bg-cyan-500 selection:text-mitwa-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Header */}
      <Header
        currentVenue={currentVenue}
        onSelectVenue={setCurrentVenue}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isCallActive={false}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
      />

      {/* Pitch Companion Modal */}
      <PitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        onRunAutoDemo={triggerAutoDemo}
      />

      {/* Main Content: Two Core Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-10">
        
        {/* Intro Banner with Pitch Assist */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-mitwa-900 to-slate-900 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  {currentVenue.name} — Live AI Voice Front Desk Demo
                </h2>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-semibold border border-cyan-500/30">
                  Pitch Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Try the pitch prompt: <span className="text-cyan-300 font-medium italic">"Bhai aaj raat 8 baje 4 logon ke liye table chahiye."</span> Mitwa checks live availability, alerts that 8 PM is booked, suggests 7:30 PM / 8:30 PM, and dispatches a WhatsApp confirmation instantly!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pitch Notes</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SECTION 1: VOICE AGENT (5 cols on lg) */}
          <section className="lg:col-span-5 h-full">
            <VoiceAgent
              currentVenue={currentVenue}
              onBookingConfirmed={handleBookingConfirmed}
              onCallIncrement={handleCallIncrement}
              isMuted={isMuted}
              registerAutoDemo={registerAutoDemo}
            />
          </section>

          {/* SECTION 2: LIVE BOOKINGS DASHBOARD (7 cols on lg) */}
          <section className="lg:col-span-7 h-full">
            <LiveDashboard
              currentVenue={currentVenue}
              bookings={bookings}
              callsCount={callsCount}
              onUpdateStatus={handleUpdateStatus}
              onResetBookings={handleResetBookings}
              newBookingId={newBookingId}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 glass-panel">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 tracking-wider">MITWA</span>
            <span>—</span>
            <span>Your AI Front Desk for Booking-Led Businesses in India</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Web Speech API Native</span>
            <span>•</span>
            <span>Automated WhatsApp Dispatch</span>
            <span>•</span>
            <span>Zero API Key Required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
