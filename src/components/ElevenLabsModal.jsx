import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, Volume2, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { speechService } from '../services/speechService';

const POPULAR_VOICES = [
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Priya / Aditi (Warm Indian Female)', desc: 'Warm, conversational Indian hospitality voice' },
  { id: '2EiwWnXFnvU5JabPnv8n', name: 'Aarav (Professional Indian Male)', desc: 'Corporate, polite Indian front desk male' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Multilingual Expressive)', desc: 'Clear, modern conversational female' },
  { id: 'custom', name: 'Custom Voice ID (From your VoiceLab)', desc: 'Paste any voice ID from your ElevenLabs dashboard' }
];

export default function ElevenLabsModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('ThT5KcBeYPX3keUQqHPh');
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [testStatus, setTestStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('mitwa_elevenlabs_key') || '';
      const savedVoice = localStorage.getItem('mitwa_elevenlabs_voice') || 'ThT5KcBeYPX3keUQqHPh';
      setApiKey(savedKey);
      if (POPULAR_VOICES.some(v => v.id === savedVoice)) {
        setVoiceId(savedVoice);
      } else {
        setVoiceId('custom');
        setCustomVoiceId(savedVoice);
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveVoiceId = voiceId === 'custom' ? customVoiceId : voiceId;

  const handleTestVoice = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter your ElevenLabs API Key.');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/tts/elevenlabs?voice_id=${encodeURIComponent(effectiveVoiceId)}&text=${encodeURIComponent('नमस्ते! मैं मितवा हूँ। बोखारा ग्रिल में आपका स्वागत है।')}`, {
        headers: {
          'xi-api-key': apiKey.trim()
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate ElevenLabs audio' }));
        throw new Error(err.detail?.message || err.error || 'Authentication error');
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setTestStatus('success');
      };

      await audio.play();
      setTestStatus('success');
    } catch (err) {
      console.error('ElevenLabs test error:', err);
      setTestStatus('error');
      setErrorMessage(err.message || 'Invalid API key or voice ID');
    }
  };

  const handleSaveConfig = () => {
    try {
      localStorage.setItem('mitwa_elevenlabs_key', apiKey.trim());
      localStorage.setItem('mitwa_elevenlabs_voice', effectiveVoiceId);
      speechService.setElevenLabsConfig(apiKey.trim(), effectiveVoiceId);
    } catch (e) {
      // ignore
    }
    if (onSave) onSave({ apiKey: apiKey.trim(), voiceId: effectiveVoiceId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl p-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-mitwa-950 font-black text-xs shadow-md">
              11L
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ElevenLabs Voice Setup
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multilingual v2
                </span>
              </h2>
              <p className="text-xs text-slate-400">Hyper-realistic Indian conversational speech</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content form */}
        <div className="space-y-4 text-xs">
          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>ElevenLabs API Key</span>
              </label>
              <a
                href="https://elevenlabs.io/app/speech-synthesis"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                Get API Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Your key is saved locally in your browser and never shared.
            </p>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Choose Indian Voice Model
            </label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none cursor-pointer"
            >
              {POPULAR_VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900">
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Voice ID Input */}
          {voiceId === 'custom' && (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Custom Voice ID from ElevenLabs VoiceLab
              </label>
              <input
                type="text"
                value={customVoiceId}
                onChange={(e) => setCustomVoiceId(e.target.value)}
                placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
              {errorMessage}
            </div>
          )}

          {/* Test Status */}
          {testStatus === 'success' && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Voice sample played successfully! Audio is crystal clear.</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={handleTestVoice}
              disabled={testStatus === 'testing'}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testStatus === 'testing' ? 'Generating Voice...' : 'Test ElevenLabs'}</span>
            </button>

            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-mitwa-950 font-bold tracking-wide transition shadow-lg shadow-cyan-500/20"
            >
              Save & Activate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
