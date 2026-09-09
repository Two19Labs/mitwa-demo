import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneCall, PhoneOff, Send, Volume2, Sparkles, 
  CheckCircle2, Clock, Users, Calendar, Phone, User, AlertCircle, RefreshCw,
  MessageSquare, Play, ShieldCheck, Settings2, Globe
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import WhatsAppPreview from './WhatsAppPreview';
import ElevenLabsModal from './ElevenLabsModal';
import { 
  createInitialBookingState, 
  processUserMessage, 
  RESTAURANT_INFO 
} from '../services/dialogEngine';
import { speechService } from '../services/speechService';
import confetti from 'canvas-confetti';

export default function VoiceAgent({ 
  currentVenue = RESTAURANT_INFO,
  onBookingConfirmed, 
  onCallIncrement, 
  isMuted,
  registerAutoDemo
}) {
  const [bookingState, setBookingState] = useState(createInitialBookingState);
  const [callActive, setCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [activeWhatsAppPayload, setActiveWhatsAppPayload] = useState(null);
  const [voiceMode, setVoiceMode] = useState(() => {
    try {
      return localStorage.getItem('mitwa_voice_mode') || 'elevenlabs_voice';
    } catch (e) {
      return 'elevenlabs_voice';
    }
  });
  const [isElevenLabsModalOpen, setIsElevenLabsModalOpen] = useState(false);

  const [transcript, setTranscript] = useState([
    {
      id: 'welcome',
      sender: 'mitwa',
      text: `Namaste! Welcome to ${currentVenue.name}. Main Mitwa hoon, aapki AI reservation assistant. Aaj aapke liye kya book karun?`,
      speechHindi: `नमस्ते! ${currentVenue.hindiName || currentVenue.name} में आपका स्वागत है। मैं मितवा हूँ, आपकी एआई रिज़र्वेशन असिस्टेंट। आज आपके लिए क्या बुक करूँ?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const chatBottomRef = useRef(null);
  const timerRef = useRef(null);

  // Update greeting when venue changes
  useEffect(() => {
    if (transcript.length === 1) {
      setTranscript([
        {
          id: 'welcome-venue-update',
          sender: 'mitwa',
          text: `Namaste! Welcome to ${currentVenue.name} (${currentVenue.city}). Main Mitwa hoon, aapki AI reservation assistant. Aaj aapke liye kya book karun?`,
          speechHindi: `नमस्ते! ${currentVenue.hindiName || currentVenue.name} में आपका स्वागत है। मैं मितवा हूँ, आपकी एआई रिज़र्वेशन असिस्टेंट। आज आपके लिए क्या बुक करूँ?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentVenue]);

  // Sync voice mode with service
  const handleVoiceModeChange = (mode) => {
    setVoiceMode(mode);
    speechService.setVoiceMode(mode);
  };

  // Call timer effect
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, agentStatus]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUserMessage = (userText) => {
    if (!userText || !userText.trim()) return;

    const trimmed = userText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsgId = `user-${Date.now()}`;
    setTranscript(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      time: timeStr
    }]);

    setAgentStatus('processing');

    setTimeout(() => {
      const result = processUserMessage(bookingState, trimmed, currentVenue);
      setBookingState(result.state);

      const mitwaMsgId = `mitwa-${Date.now()}`;
      setTranscript(prev => [...prev, {
        id: mitwaMsgId,
        sender: 'mitwa',
        text: result.reply,
        speechHindi: result.speechHindi,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingCompleted: result.bookingCompleted
      }]);

      if (result.bookingCompleted && result.booking) {
        onBookingConfirmed(result.booking);
        if (result.whatsApp) {
          setActiveWhatsAppPayload(result.whatsApp);
        }
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }

      // Speak using authentic Indian voice engine
      if (!isMuted) {
        setAgentStatus('speaking');
        speechService.speak(
          { speech: result.speech, speechHindi: result.speechHindi },
          () => setAgentStatus('speaking'),
          () => {
            setAgentStatus('idle');
            if (callActive && !result.bookingCompleted) {
              startListeningLoop();
            }
          }
        );
      } else {
        setAgentStatus('idle');
        if (callActive && !result.bookingCompleted) {
          startListeningLoop();
        }
      }
    }, 450);
  };

  const startListeningLoop = () => {
    setAgentStatus('listening');
    const started = speechService.startListening(
      (speechText) => {
        handleUserMessage(speechText);
      },
      (status) => {
        if (status === 'unsupported') {
          setSpeechSupported(false);
          setAgentStatus('idle');
        } else {
          setAgentStatus(status);
        }
      }
    );

    if (!started) {
      setAgentStatus('idle');
    }
  };

  const startCall = () => {
    setCallActive(true);
    if (onCallIncrement) onCallIncrement();

    if (transcript.length === 1 && !isMuted) {
      setAgentStatus('speaking');
      speechService.speak(
        { speech: transcript[0].text, speechHindi: transcript[0].speechHindi },
        () => setAgentStatus('speaking'),
        () => {
          setAgentStatus('idle');
          startListeningLoop();
        }
      );
    } else {
      startListeningLoop();
    }
  };

  const endCall = () => {
    setCallActive(false);
    speechService.stopListening();
    speechService.stopSpeaking();
    setAgentStatus('idle');
  };

  const resetConversation = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setCallActive(false);
    setAgentStatus('idle');
    setBookingState(createInitialBookingState());
    setTranscript([
      {
        id: 'welcome-reset',
        sender: 'mitwa',
        text: `Namaste! ${currentVenue.name} me aapka swagat hai. Main Mitwa hoon. Aapko kab aur kitne logon ke liye table reserve karni hai?`,
        speechHindi: `नमस्ते! ${currentVenue.hindiName || currentVenue.name} में आपका स्वागत है। मैं मितवा हूँ। आपको कब और कितने लोगों के लिए टेबल रिज़र्व करनी है?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveWhatsAppPayload(null);
  };

  const runAutoDemoFlow = () => {
    resetConversation();
    setCallActive(true);
    if (onCallIncrement) onCallIncrement();

    setTimeout(() => {
      handleUserMessage("Bhai aaj raat 8 baje 4 logon ke liye table chahiye.");
    }, 1000);

    setTimeout(() => {
      handleUserMessage("7:30 PM theek rahega, table book kar do.");
    }, 3800);

    setTimeout(() => {
      handleUserMessage("Mera naam Rahul Sharma hai aur mobile number 9876543210 hai.");
    }, 6600);
  };

  useEffect(() => {
    if (registerAutoDemo) {
      registerAutoDemo(runAutoDemoFlow);
    }
  }, [registerAutoDemo]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput('');
    handleUserMessage(text);
  };

  const replayMessage = (msg) => {
    setAgentStatus('speaking');
    speechService.speak(
      { speech: msg.text, speechHindi: msg.speechHindi },
      () => setAgentStatus('speaking'),
      () => setAgentStatus('idle')
    );
  };

  const demoPrompts = [
    {
      label: "Bhai aaj raat 8 baje 4 logon ke liye table chahiye (Test 8 PM rule)",
      text: "Bhai aaj raat 8 baje 4 logon ke liye table chahiye."
    },
    {
      label: "7:30 PM theek rahega, book kardo",
      text: "7:30 PM theek rahega, table book kar do."
    },
    {
      label: "Rahul Sharma, 9876543210",
      text: "Mera naam Rahul Sharma hai aur mobile number 9876543210 hai."
    },
    {
      label: "Sunday Family Brunch (8 guests)",
      text: "Sunday dopahar 1:30 baje 8 logon ki table reserve karni hai for Pooja, 9812345678."
    }
  ];

  return (
    <div className="flex flex-col h-full rounded-3xl glass-panel p-5 lg:p-6 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {activeWhatsAppPayload && (
        <WhatsAppPreview
          payload={activeWhatsAppPayload}
          onClose={() => setActiveWhatsAppPayload(null)}
        />
      )}

      {/* ElevenLabs Configuration Modal */}
      <ElevenLabsModal
        isOpen={isElevenLabsModalOpen}
        onClose={() => setIsElevenLabsModalOpen(false)}
        onSave={(cfg) => {
          setVoiceMode('elevenlabs_voice');
          speechService.setElevenLabsConfig(cfg.apiKey, cfg.voiceId);
        }}
      />

      {/* Top Section Header with Voice Engine Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 mb-3.5 gap-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              MITWA Voice Assistant
            </h2>
            {callActive && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {formatTimer(callDuration)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {currentVenue.name} • Speaks Hindi, Hinglish & English
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Accent Switcher */}
          <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
            <select
              value={voiceMode}
              onChange={(e) => {
                const val = e.target.value;
                handleVoiceModeChange(val);
                if (val === 'elevenlabs_voice' && !localStorage.getItem('mitwa_elevenlabs_key')) {
                  setIsElevenLabsModalOpen(true);
                }
              }}
              className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer pr-1"
              title="Select Voice for Mitwa"
            >
              <option value="elevenlabs_voice" className="bg-slate-900 text-white">⚡ ElevenLabs (Multilingual v2)</option>
              <option value="swara_hindi" className="bg-slate-900 text-white">🇮🇳 Swara (Natural Hindi Female)</option>
              <option value="madhur_hindi" className="bg-slate-900 text-white">🇮🇳 Madhur (Natural Hindi Male)</option>
              <option value="neerja_english" className="bg-slate-900 text-white">🇮🇳 Neerja (Indian English)</option>
              <option value="browser_native" className="bg-slate-900 text-white">💻 System Voice</option>
            </select>
          </div>

          {/* ElevenLabs Quick Setup Button */}
          <button
            onClick={() => setIsElevenLabsModalOpen(true)}
            title="Configure ElevenLabs API Key and Voice ID"
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition font-semibold"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ElevenLabs</span>
          </button>

          {/* Test Voice Button */}
          <button
            onClick={() => {
              speechService.speak(
                {
                  speech: "Namaste! Main Mitwa hoon. Aapke liye table kab book karun?",
                  speechHindi: "नमस्ते! मैं मितवा हूँ, बोखारा ग्रिल से। आपके लिए टेबल कब बुक करूँ?"
                },
                () => setAgentStatus('speaking'),
                () => setAgentStatus('idle')
              );
            }}
            title="Hear a quick voice sample"
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition font-semibold"
          >
            <Volume2 className="w-3 h-3" />
            <span>Test Voice</span>
          </button>

          <button
            onClick={runAutoDemoFlow}
            title="Auto-play full 3-turn reservation scenario for live pitch"
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition font-medium"
          >
            <Play className="w-3 h-3 fill-cyan-400" />
            <span className="hidden sm:inline">Pitch Auto-Demo</span>
          </button>

          <button
            onClick={resetConversation}
            className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl bg-slate-900/60 border border-slate-800 transition"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Voice Interaction Hero Area */}
      <div className="flex flex-col items-center justify-center py-3 px-2 z-10">
        <div className="relative flex items-center justify-center my-1.5">
          {callActive && (
            <>
              <div className="absolute w-36 h-36 rounded-full border border-cyan-400/40 mic-ring-1 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-teal-400/30 mic-ring-2 pointer-events-none" />
              <div className="absolute w-52 h-52 rounded-full border border-cyan-300/20 mic-ring-3 pointer-events-none" />
            </>
          )}

          <button
            onClick={callActive ? endCall : startCall}
            className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none ${
              callActive
                ? agentStatus === 'speaking'
                  ? 'bg-gradient-to-tr from-teal-600 via-cyan-500 to-emerald-400 glow-cyan-lg scale-105'
                  : 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-400 glow-cyan-lg scale-105'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 group'
            }`}
          >
            {callActive ? (
              <>
                <PhoneOff className="w-9 h-9 text-white animate-pulse" />
                <span className="text-[11px] font-bold text-white/90 mt-1 uppercase tracking-wider">
                  End Call
                </span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition" />
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white mt-1 uppercase tracking-wider">
                  Start Call
                </span>
              </>
            )}
          </button>
        </div>

        {/* Live Audio Visualizer */}
        <div className="w-full max-w-sm mt-1">
          <AudioVisualizer status={agentStatus} />
        </div>

        {/* Status indicator text */}
        <div className="text-center mt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-800">
            {agentStatus === 'listening' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300">Listening to you... (Speak now)</span>
              </>
            )}
            {agentStatus === 'speaking' && (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-300">Mitwa is speaking (Indian Voice)...</span>
              </>
            )}
            {agentStatus === 'processing' && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="text-cyan-200">Mitwa is thinking...</span>
              </>
            )}
            {agentStatus === 'idle' && (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {callActive ? 'Ready for your response • Tap mic or speak' : 'Press "Start Call" to begin speaking with Mitwa'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Booking Slots Collected Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-3 border border-white/5 my-2.5 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Reservation Details Collected
          </span>
          {bookingState.isConfirmed ? (
            <div className="flex items-center gap-2">
              {activeWhatsAppPayload && (
                <button
                  onClick={() => setActiveWhatsAppPayload(activeWhatsAppPayload)}
                  className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                >
                  <MessageSquare className="w-2.5 h-2.5" /> View WhatsApp
                </button>
              )}
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-cyan-300 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full">
              In Progress
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className={`p-2 rounded-xl border ${bookingState.guests ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Users className="w-3 h-3" /> Guests
            </div>
            <div className="font-semibold mt-0.5 truncate">
              {bookingState.guests ? `${bookingState.guests} Guests` : 'Pending'}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${bookingState.date ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="w-3 h-3" /> Date
            </div>
            <div className="font-semibold mt-0.5 truncate">
              {bookingState.date || 'Pending'}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${
            bookingState.time 
              ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' 
              : bookingState.rejected8pm 
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' 
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" /> Time
            </div>
            <div className="font-semibold mt-0.5 truncate">
              {bookingState.time || (bookingState.rejected8pm ? '8 PM Booked' : 'Pending')}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${bookingState.name ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <User className="w-3 h-3" /> Name
            </div>
            <div className="font-semibold mt-0.5 truncate">
              {bookingState.name || 'Pending'}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${bookingState.phone ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Phone className="w-3 h-3" /> Phone
            </div>
            <div className="font-semibold mt-0.5 truncate">
              {bookingState.phone || 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Transcript / Chat Bubbles */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2 min-h-[200px] max-h-[280px] z-10" data-testid="transcript-container">
        {transcript.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              data-testid="chat-bubble"
              data-sender={msg.sender}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                <span className="font-semibold text-slate-300">
                  {isUser ? 'You' : 'Mitwa (AI Front Desk)'}
                </span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed relative ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-br-none'
                    : msg.bookingCompleted
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 rounded-bl-none shadow-emerald-900/30'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p data-testid="chat-message-text">{msg.text}</p>

                {!isUser && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => replayMessage(msg)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                      title="Listen with Indian Voice"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak aloud</span>
                    </button>
                    {msg.bookingCompleted && activeWhatsAppPayload && (
                      <button
                        onClick={() => setActiveWhatsAppPayload(activeWhatsAppPayload)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition font-medium"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Preview WhatsApp</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Test Prompt Chips */}
      <div className="my-2 z-10">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <span>Try quick sample queries:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {demoPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleUserMessage(item.text)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Fallback Input Box */}
      <form onSubmit={handleTextSubmit} className="flex items-center gap-2 mt-1.5 z-10">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Speak or type (e.g. 'Bhai aaj raat 8 baje 4 logon ke liye table chahiye')..."
          className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!textInput.trim()}
          className="p-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-mitwa-950 font-bold transition shadow-md shadow-cyan-500/20"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
