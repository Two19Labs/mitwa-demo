# MITWA — "Your AI Front Desk"
### AI Voice & Chat Reservation Agent for Booking-Led Businesses in India

Mitwa is an intelligent voice and chat agent built for Indian restaurants and hospitality businesses. It eliminates missed phone calls during peak hours, speaks native languages (Hindi, Hinglish, English), dynamically checks and enforces table availability rules, and instantly auto-syncs reservations to a live restaurant operations dashboard and customer WhatsApp.

---

## 🚀 Key Features

### 1. Section 1: Voice Agent Interface
- **Browser-Native Web Speech API**: Real-time speech recognition and voice synthesis without external paid API keys.
- **Multilingual Understanding**: Native support for **Hindi**, **Hinglish**, and **English** (e.g. *"Bhai aaj raat 8 baje 4 logon ke liye table chahiye"*).
- **Table Availability Enforcement**:
  - Available slots: `7:00 PM`, `7:30 PM`, `8:30 PM`, `9:00 PM`.
  - Unavailable slot: `8:00 PM` (Mitwa informs that 8 PM is fully booked and recommends `7:30 PM` or `8:30 PM`).
- **Simulated WhatsApp Confirmation**: Displays the verified WhatsApp confirmation notification delivered to the customer upon booking.
- **Microphone Call UI**: Concentric glowing audio wave rings, live call timer, waveform equalizer, and quick prompt chips.

### 2. Section 2: Live Bookings & Operations Dashboard
- **Top Metrics**: Calls Today, Bookings Confirmed, Available Tables, and Estimated Revenue Saved (₹48.5K+).
- **Dual View**:
  - **Table View**: Real-time list of today's reservations with status tags (`Confirmed`, `Seated`, `Cancelled`).
  - **Floor Plan View**: Visual 12-table layout across Patio, Main Dining Hall, VIP Lounge, and Private Dining.
- **Instant Live Sync**: New voice bookings appear live with a cyan highlight flash and `NEW` badge without refreshing the page.

### 3. Pitch Presentation Mode
- **Pitch Companion**: Investor problem-solution summary and a **30-second presenter script**.
- **1-Click Auto Demo**: Runs the entire multi-turn booking dialog autonomously for live stage presentations.
- **Multi-Venue Switcher**: Toggle between Bangalore (*Bukhara Grill*), Gurgaon (*Punjab Grill*), and Mumbai (*O Pedro*).

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/Two19Labs/mitwa-demo.git
cd mitwa-demo

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173/](http://localhost:5173/) in Google Chrome or Microsoft Edge.
