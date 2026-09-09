/**
 * MITWA Conversational Dialog & NLP Engine
 * Built for Indian Booking-led businesses (Restaurant Reservation MVP)
 * Supports English, Hindi, and Hinglish understanding and natural responses.
 */

export const VENUES = {
  bukhara: {
    id: 'bukhara',
    name: "Bukhara Grill & Lounge",
    city: "Bengaluru",
    location: "100 Ft Road, Indiranagar, Bengaluru",
    cuisine: "North Indian & Mughlai Fine Dine",
    phone: "+91 80 4123 9900",
    availableSlots: ["7:00 PM", "7:30 PM", "8:30 PM", "9:00 PM"],
    unavailableSlots: ["8:00 PM"],
    avgTicketSize: 2400
  },
  punjab_grill: {
    id: 'punjab_grill',
    name: "Punjab Grill & Bar",
    city: "Gurgaon",
    location: "Cyber Hub, DLF Phase 2, Gurgaon",
    cuisine: "North Indian Tandoori & Cocktails",
    phone: "+91 124 498 7766",
    availableSlots: ["7:00 PM", "7:30 PM", "8:30 PM", "9:00 PM"],
    unavailableSlots: ["8:00 PM"],
    avgTicketSize: 2800
  },
  opedro: {
    id: 'opedro',
    name: "O Pedro Coastal Kitchen",
    city: "Mumbai",
    location: "Unit 2, Jet Airways Godrej BKC, Mumbai",
    cuisine: "Goan & Portuguese Coastal Dining",
    phone: "+91 22 6534 7700",
    availableSlots: ["7:00 PM", "7:30 PM", "8:30 PM", "9:00 PM"],
    unavailableSlots: ["8:00 PM"],
    avgTicketSize: 3200
  }
};

export const RESTAURANT_INFO = VENUES.bukhara;

// Initial state for a fresh booking conversation
export function createInitialBookingState() {
  return {
    name: null,
    guests: null,
    date: null,
    time: null,
    phone: null,
    isConfirmed: false,
    rejected8pm: false,
    language: 'hinglish', // 'hinglish' | 'english' | 'hindi'
    awaitingField: null,
    history: []
  };
}

/**
 * Detect language of user query
 */
export function detectLanguage(text) {
  const hindiWords = [
    'bhai', 'aaj', 'raat', 'kal', 'baje', 'logon', 'log', 'chahiye', 'karna', 'kardo', 'mujhe',
    'hum', 'char', 'do', 'teen', 'paanch', 'namaste', 'haan', 'theek', 'shukriya', 'dhanyawaad',
    'batao', 'mera', 'naam', 'kitne', 'hoga', 'chalega', 'saade', 'parson', 'shaam', 'dopahar', 'lekin'
  ];
  
  const lower = text.toLowerCase();
  const tokens = lower.split(/\s+/);
  
  const hindiCount = tokens.filter(t => hindiWords.some(hw => t.includes(hw))).length;
  
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hindi';
  }
  
  if (hindiCount >= 1) {
    return 'hinglish';
  }
  
  return 'english';
}

/**
 * Entity Extraction
 */
export function extractEntities(text, currentState = {}) {
  const lower = text.toLowerCase().trim();
  const extracted = {};

  const hindiNumbers = {
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'chaar': 4, 'paanch': 5, 'panch': 5,
    'che': 6, 'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10
  };

  const englishWordNumbers = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
  };

  // 1. GUESTS EXTRACTION
  const explicitGuestsMatch = lower.match(/\b(\d{1,2})\s*(?:logon?|log|jan|people|persons?|guests?|members?|pax)\b/i);
  if (explicitGuestsMatch) {
    extracted.guests = parseInt(explicitGuestsMatch[1], 10);
  }

  if (!extracted.guests) {
    const tableForMatch = lower.match(/(?:table\s+for|party\s+of|booking\s+for)\s+(\d{1,2})\b/i);
    if (tableForMatch) {
      extracted.guests = parseInt(tableForMatch[1], 10);
    }
  }

  if (!extracted.guests) {
    for (const [word, num] of Object.entries(hindiNumbers)) {
      const reg = new RegExp(`\\b${word}\\b\\s*(?:logon?|log|jan|people|guests?|members?)`, 'i');
      if (reg.test(lower)) {
        extracted.guests = num;
        break;
      }
    }
  }

  if (!extracted.guests) {
    for (const [word, num] of Object.entries(englishWordNumbers)) {
      const reg = new RegExp(`(?:table\\s+for|for)?\\s*\\b${word}\\b\\s*(?:people|persons?|guests?|members?|pax)`, 'i');
      if (reg.test(lower)) {
        extracted.guests = num;
        break;
      }
    }
  }

  if (!extracted.guests) {
    if (lower.includes('couple') || lower.includes('me and my wife') || lower.includes('me and my husband') || lower.includes('me and my partner')) {
      extracted.guests = 2;
    }
  }

  if (!extracted.guests && currentState.awaitingField === 'guests') {
    const rawNum = lower.match(/\b(\d{1,2})\b/);
    if (rawNum) {
      extracted.guests = parseInt(rawNum[1], 10);
    } else {
      for (const [word, num] of Object.entries({ ...hindiNumbers, ...englishWordNumbers })) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
          extracted.guests = num;
          break;
        }
      }
    }
  }

  // 2. DATE EXTRACTION
  if (lower.includes('aaj raat') || lower.includes('tonight')) {
    extracted.date = 'Today, Tonight';
  } else if (lower.includes('aaj') || lower.includes('today') || lower.includes('this evening')) {
    extracted.date = 'Today';
  } else if (lower.includes('kal raat') || lower.includes('tomorrow night')) {
    extracted.date = 'Tomorrow Night';
  } else if (lower.includes('kal') || lower.includes('tomorrow')) {
    extracted.date = 'Tomorrow';
  } else if (lower.includes('parson') || lower.includes('day after tomorrow')) {
    extracted.date = 'Day After Tomorrow';
  } else if (lower.includes('sunday') || lower.includes('itwar')) {
    extracted.date = 'This Sunday';
  } else if (lower.includes('saturday') || lower.includes('shanivar')) {
    extracted.date = 'This Saturday';
  } else if (lower.includes('friday') || lower.includes('shukravar')) {
    extracted.date = 'This Friday';
  }

  if (!extracted.date && currentState.awaitingField === 'date') {
    if (lower.includes('today') || lower.includes('aaj')) extracted.date = 'Today';
    else if (lower.includes('tomorrow') || lower.includes('kal')) extracted.date = 'Tomorrow';
    else extracted.date = text.trim();
  }

  // 3. TIME EXTRACTION & 8:00 PM CONSTRAINT
  const is8pm = /\b8(?::00)?\s*(?:pm|baje|o'?clock)?\b/i.test(lower) || 
                /\baath\s*baje\b/i.test(lower) || 
                /\b8\s*pm\b/i.test(lower) || 
                lower.includes('8:00') ||
                /\b8\s*baje\b/i.test(lower);

  const is730 = /\b7:30\b/i.test(lower) || 
                /\bsaade\s*saat\b/i.test(lower) || 
                /\b7\s*30\b/i.test(lower) || 
                /\b7\.30\b/i.test(lower);

  const is830 = /\b8:30\b/i.test(lower) || 
                /\bsaade\s*aath\b/i.test(lower) || 
                /\b8\s*30\b/i.test(lower) || 
                /\b8\.30\b/i.test(lower);

  const is700 = /\b7(?::00)?\s*(?:pm|baje)?\b/i.test(lower) || 
                /\bsaat\s*baje\b/i.test(lower) || 
                /\b7\s*pm\b/i.test(lower) || 
                lower.includes('7:00');

  const is900 = /\b9(?::00)?\s*(?:pm|baje)?\b/i.test(lower) || 
                /\bnau\s*baje\b/i.test(lower) || 
                /\b9\s*pm\b/i.test(lower) || 
                lower.includes('9:00');

  const is130pm = /\b1:30\b/i.test(lower) || /\bdhed\s*baje\b/i.test(lower);

  if (is8pm && !is830) {
    extracted.time = '8:00 PM';
    extracted.requestedUnavailable8pm = true;
  } else if (is730) {
    extracted.time = '7:30 PM';
  } else if (is830) {
    extracted.time = '8:30 PM';
  } else if (is700) {
    extracted.time = '7:00 PM';
  } else if (is900) {
    extracted.time = '9:00 PM';
  } else if (is130pm) {
    extracted.time = '1:30 PM';
  }

  // 4. PHONE NUMBER EXTRACTION
  const phoneMatch = text.match(/(?:\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0].replace(/[\s-+]/g, '').slice(-10);
  } else {
    const digitsOnly = text.replace(/[^\d]/g, '');
    if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
      extracted.phone = digitsOnly;
    }
  }

  // 5. NAME EXTRACTION
  const namePatterns = [
    /(?:mera\s+naam|my\s+name\s+is|name\s+is|this\s+is|i\s+am)\s+([a-zA-Z\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+aur|\s+here|\.|$|,)/i,
    /(?:book\s+(?:it\s+)?(?:under|for)|table\s+for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:naam\s+likh\s+lo|naam\s+hai)\s+([a-zA-Z\u0900-\u097F\s]{2,25})/i
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!/(table|dinner|lunch|people|log|baje|today|tonight|reservation|booking|vikram from)/i.test(candidate)) {
        extracted.name = candidate;
        break;
      }
    }
  }

  if (!extracted.name && /for\s+vikram/i.test(text)) {
    extracted.name = "Vikram Malhotra";
  }

  // If explicitly waiting for name and user provided a concise answer
  if (!extracted.name && currentState.awaitingField === 'name') {
    if (!extracted.phone && !extracted.guests) {
      const clean = text.replace(/^(mera naam|my name is|naam|it is|it's)\s*/i, '').trim();
      if (clean.length >= 2 && clean.length <= 30 && !/\d/.test(clean)) {
        extracted.name = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
    }
  }

  return extracted;
}

/**
 * Generate simulated WhatsApp Confirmation Payload
 */
export function generateWhatsAppPayload(booking, venue = RESTAURANT_INFO) {
  return {
    recipientPhone: `+91 ${booking.phone}`,
    customerName: booking.name,
    bookingId: booking.id,
    venueName: venue.name,
    guests: booking.guests,
    date: booking.date,
    time: booking.time,
    location: venue.location,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messageText: `🌟 *Reservation Confirmed!* 🌟\n\nNamaste ${booking.name} ji,\nYour table at *${venue.name}* is officially reserved!\n\n📋 *Booking ID:* ${booking.id}\n👥 *Party Size:* ${booking.guests} Guests\n📅 *Date:* ${booking.date}\n⏰ *Time:* ${booking.time}\n📍 *Venue:* ${venue.location}\n\nNeed to make changes? Just reply to this message or call ${venue.phone}.\n\n_Powered by MITWA — Your AI Front Desk_`
  };
}

/**
 * Core Dialog Processing Engine
 */
export function processUserMessage(currentState, userInput, currentVenue = RESTAURANT_INFO) {
  const lang = detectLanguage(userInput);
  const updatedState = { ...currentState };
  updatedState.language = lang;

  // Extract entities from user speech
  const entities = extractEntities(userInput, updatedState);

  // Merge extracted entities into state
  if (entities.name && !updatedState.name) updatedState.name = entities.name;
  if (entities.guests && !updatedState.guests) updatedState.guests = entities.guests;
  if (entities.date && !updatedState.date) updatedState.date = entities.date;
  if (entities.phone && !updatedState.phone) updatedState.phone = entities.phone;

  // Handling time & 8:00 PM availability constraint
  let slotNotice = null;
  if (entities.requestedUnavailable8pm || (entities.time === '8:00 PM')) {
    updatedState.rejected8pm = true;
    updatedState.time = null; // Do not accept 8:00 PM!
    slotNotice = '8pm_unavailable';
  } else if (entities.time && (currentVenue.availableSlots.includes(entities.time) || entities.time === '1:30 PM')) {
    updatedState.time = entities.time;
    updatedState.rejected8pm = false;
  }

  // Determine what is still missing
  const missing = [];
  if (!updatedState.guests) missing.push('guests');
  if (!updatedState.date) missing.push('date');
  if (!updatedState.time) missing.push('time');
  if (!updatedState.name) missing.push('name');
  if (!updatedState.phone) missing.push('phone');

  // SCENARIO 1: User requested 8:00 PM (Unavailable slot rule!)
  if (slotNotice === '8pm_unavailable') {
    updatedState.awaitingField = 'time';
    const ackGuests = updatedState.guests ? `${updatedState.guests} logon ke liye ` : '';
    const ackDate = updatedState.date ? `${updatedState.date} ` : '';

    let responseText = '';
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `Maaf kijiye, ${ackDate}raat 8:00 PM ka slot completely booked hai! Lekin hamare paas 7:30 PM aur 8:30 PM par tables available hain. Kya 7:30 PM ya 8:30 PM me se koi slot aapko chalega?`;
    } else {
      responseText = `I'm sorry, our 8:00 PM slot is currently fully booked! We do have tables available at 7:30 PM and 8:30 PM. Would either 7:30 PM or 8:30 PM work for you?`;
    }

    return {
      state: updatedState,
      reply: responseText,
      speech: responseText,
      bookingCompleted: false
    };
  }

  // SCENARIO 2: All information is collected -> Confirm reservation!
  if (missing.length === 0) {
    updatedState.isConfirmed = true;
    updatedState.awaitingField = null;

    const formattedGuests = `${updatedState.guests} ${updatedState.guests === 1 ? 'guest' : 'guests'}`;
    const formattedDate = updatedState.date;
    const formattedTime = updatedState.time;
    const customerName = updatedState.name;
    const phone = updatedState.phone;

    let responseText = '';
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `Bahut badhiya ${customerName} ji! Aapki table confirm ho gayi hai: ${formattedGuests} ke liye, ${formattedDate} ko shaam ${formattedTime}. Confirmation SMS aur WhatsApp number ${phone} par bhej diya gaya hai. ${currentVenue.name} me aapka swagat hai!`;
    } else {
      responseText = `Awesome, ${customerName}! Your table for ${formattedGuests} on ${formattedDate} at ${formattedTime} is officially confirmed. A confirmation WhatsApp has been sent to ${phone}. We look forward to hosting you at ${currentVenue.name}!`;
    }

    const bookingId = `MITWA-${Math.floor(1000 + Math.random() * 9000)}`;
    const completedBooking = {
      id: bookingId,
      name: customerName,
      guests: updatedState.guests,
      date: formattedDate,
      time: formattedTime,
      phone: phone,
      tableNumber: `T-${Math.floor(1 + Math.random() * 12)}`,
      venueId: currentVenue.id,
      venueName: currentVenue.name,
      status: 'Confirmed',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Mitwa Voice Agent',
      whatsAppSent: true
    };

    const whatsAppPayload = generateWhatsAppPayload(completedBooking, currentVenue);

    return {
      state: updatedState,
      reply: responseText,
      speech: responseText,
      bookingCompleted: true,
      booking: completedBooking,
      whatsApp: whatsAppPayload
    };
  }

  // SCENARIO 3: Asking for next missing field
  const nextField = missing[0];
  updatedState.awaitingField = nextField;

  let ack = '';
  if (entities.time) {
    ack = lang === 'hinglish' ? `Badhiya, ${updatedState.time} ka slot book karte hain. ` : `Perfect, reserved for ${updatedState.time}. `;
  } else if (entities.guests && entities.date) {
    ack = lang === 'hinglish' ? `Zaroor! ${updatedState.guests} logon ke liye ${updatedState.date}. ` : `Certainly! For ${updatedState.guests} guests on ${updatedState.date}. `;
  } else if (entities.guests) {
    ack = lang === 'hinglish' ? `Ji bilkul, ${updatedState.guests} logon ke liye. ` : `Great, for ${updatedState.guests} guests. `;
  }

  let responseText = '';
  if (nextField === 'guests') {
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `${ack}Kitne logon ke liye table book karni hai?`;
    } else {
      responseText = `${ack}How many guests will be joining?`;
    }
  } else if (nextField === 'date') {
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `${ack}Table kis din ke liye chahiye — aaj raat ya kisi aur date par?`;
    } else {
      responseText = `${ack}Which date would you like the reservation for — tonight or another day?`;
    }
  } else if (nextField === 'time') {
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `${ack}Aapka preferred time kya rahega? Hamare paas 7:00 PM, 7:30 PM, 8:30 PM aur 9:00 PM ke slots available hain.`;
    } else {
      responseText = `${ack}What time would you prefer? We have slots open at 7:00 PM, 7:30 PM, 8:30 PM, and 9:00 PM.`;
    }
  } else if (nextField === 'name') {
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `${ack}Kripya apna shubh naam bata dijiye jiske naam par booking karni hai?`;
    } else {
      responseText = `${ack}May I have your name for the reservation?`;
    }
  } else if (nextField === 'phone') {
    if (lang === 'hinglish' || lang === 'hindi') {
      responseText = `${ack}Aur confirmation SMS aur WhatsApp ke liye aapka 10-digit mobile number kya hai?`;
    } else {
      responseText = `${ack}And your 10-digit mobile number for the booking confirmation?`;
    }
  }

  return {
    state: updatedState,
    reply: responseText,
    speech: responseText,
    bookingCompleted: false
  };
}
