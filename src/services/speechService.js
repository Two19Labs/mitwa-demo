/**
 * Web Speech & Neural Indian Voice Service
 * Supports ElevenLabs Multilingual v2, Microsoft Azure Neural (Swara/Madhur), and Web Speech fallback.
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.muted = false;
    this.currentAudio = null;
    this.voiceMode = 'elevenlabs_voice'; // 'elevenlabs_voice' | 'swara_hindi' | 'madhur_hindi' | 'neerja_english' | 'browser_native'
    this.selectedLanguage = 'hi-IN';
    this.elevenLabsKey = '';
    this.elevenLabsVoiceId = 'ThT5KcBeYPX3keUQqHPh';
    this.onResultCallback = null;
    this.onStatusChangeCallback = null;
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];

    this.initRecognition();
    this.loadVoices();
    this.loadSavedConfig();
  }

  loadSavedConfig() {
    if (typeof window === 'undefined') return;
    try {
      const savedKey = localStorage.getItem('mitwa_elevenlabs_key');
      const savedVoice = localStorage.getItem('mitwa_elevenlabs_voice');
      const savedMode = localStorage.getItem('mitwa_voice_mode');
      if (savedKey) this.elevenLabsKey = savedKey;
      if (savedVoice) this.elevenLabsVoiceId = savedVoice;
      if (savedMode) this.voiceMode = savedMode;
    } catch (e) {
      // ignore
    }
  }

  setElevenLabsConfig(key, voiceId) {
    this.elevenLabsKey = key;
    this.elevenLabsVoiceId = voiceId;
    this.voiceMode = 'elevenlabs_voice';
    try {
      localStorage.setItem('mitwa_elevenlabs_key', key);
      localStorage.setItem('mitwa_elevenlabs_voice', voiceId);
      localStorage.setItem('mitwa_voice_mode', 'elevenlabs_voice');
    } catch (e) {
      // ignore
    }
  }

  loadVoices() {
    if (!this.speechSynthesis) return;
    const updateVoices = () => {
      this.voices = this.speechSynthesis.getVoices();
    };
    updateVoices();
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.selectedLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback('listening');
      };

      this.recognition.onresult = (event) => {
        if (!event.results || event.results.length === 0) return;
        const transcript = event.results[0][0].transcript;
        if (this.onResultCallback && transcript.trim()) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Recognition notice:', event.error);
        this.isListening = false;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (!this.isSpeaking && this.onStatusChangeCallback) {
          this.onStatusChangeCallback('idle');
        }
      };
    } catch (e) {
      console.error('Error initializing SpeechRecognition:', e);
    }
  }

  setLanguage(langCode) {
    this.selectedLanguage = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  setVoiceMode(mode) {
    this.voiceMode = mode;
    try {
      localStorage.setItem('mitwa_voice_mode', mode);
    } catch (e) {
      // ignore
    }
  }

  startListening(onResult, onStatusChange) {
    if (onResult) this.onResultCallback = onResult;
    if (onStatusChange) this.onStatusChangeCallback = onStatusChange;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('unsupported');
      return false;
    }

    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }

  /**
   * Speak Method
   */
  async speak(textOptions, onStart, onEnd) {
    if (this.muted) {
      if (onEnd) onEnd();
      return;
    }

    this.stopListening();
    this.stopSpeaking();

    let spokenText = '';
    let phoneticHindi = '';

    if (typeof textOptions === 'object' && textOptions !== null) {
      spokenText = textOptions.speech || textOptions.reply || '';
      phoneticHindi = textOptions.speechHindi || '';
    } else {
      spokenText = textOptions || '';
    }

    const textToSpeak = phoneticHindi || spokenText;

    // 1. ELEVENLABS MODE
    if (this.voiceMode === 'elevenlabs_voice') {
      try {
        const headers = {};
        if (this.elevenLabsKey) {
          headers['xi-api-key'] = this.elevenLabsKey;
        }

        const voiceId = this.elevenLabsVoiceId || 'ThT5KcBeYPX3keUQqHPh';
        const url = `/api/tts/elevenlabs?voice_id=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(textToSpeak)}`;
        
        const res = await fetch(url, { headers });
        if (res.ok) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          audio.onplay = () => {
            this.isSpeaking = true;
            if (onStart) onStart();
            if (this.onStatusChangeCallback) this.onStatusChangeCallback('speaking');
          };

          audio.onended = () => {
            this.isSpeaking = false;
            this.currentAudio = null;
            if (onEnd) onEnd();
            if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
          };

          audio.onerror = () => {
            this.fallbackSwaraSpeak(textToSpeak, onStart, onEnd);
          };

          await audio.play();
          return;
        } else {
          console.warn('ElevenLabs returned non-200, falling back to Swara Neural voice');
          this.fallbackSwaraSpeak(textToSpeak, onStart, onEnd);
          return;
        }
      } catch (err) {
        console.warn('ElevenLabs audio error, falling back to Swara Neural:', err);
        this.fallbackSwaraSpeak(textToSpeak, onStart, onEnd);
        return;
      }
    }

    // 2. AZURE NEURAL EDGE MODES
    if (this.voiceMode === 'swara_hindi' || this.voiceMode === 'madhur_hindi' || this.voiceMode === 'neerja_english') {
      let voiceParam = 'hi-IN-SwaraNeural';
      if (this.voiceMode === 'madhur_hindi') voiceParam = 'hi-IN-MadhurNeural';
      if (this.voiceMode === 'neerja_english') voiceParam = 'en-IN-NeerjaNeural';

      try {
        const url = `/api/tts?voice=${encodeURIComponent(voiceParam)}&text=${encodeURIComponent(textToSpeak)}`;
        const audio = new Audio(url);
        this.currentAudio = audio;

        audio.onplay = () => {
          this.isSpeaking = true;
          if (onStart) onStart();
          if (this.onStatusChangeCallback) this.onStatusChangeCallback('speaking');
        };

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudio = null;
          if (onEnd) onEnd();
          if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
        };

        audio.onerror = () => {
          this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
        };

        audio.play().catch(() => {
          this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
        });
        return;
      } catch (e) {
        this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
        return;
      }
    }

    // 3. BROWSER SAPI FALLBACK
    this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
  }

  fallbackSwaraSpeak(text, onStart, onEnd) {
    try {
      const url = `/api/tts?voice=hi-IN-SwaraNeural&text=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
        if (this.onStatusChangeCallback) this.onStatusChangeCallback('speaking');
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
        if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
      };

      audio.onerror = () => {
        this.fallbackBrowserSpeak(text, onStart, onEnd);
      };

      audio.play().catch(() => {
        this.fallbackBrowserSpeak(text, onStart, onEnd);
      });
    } catch (e) {
      this.fallbackBrowserSpeak(text, onStart, onEnd);
    }
  }

  fallbackBrowserSpeak(text, onStart, onEnd) {
    if (!this.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    if (this.voices.length === 0) {
      this.voices = this.speechSynthesis.getVoices();
    }

    const indianVoice = this.voices.find(v => 
      (v.lang.includes('IN') || v.lang.includes('hi') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('hindi'))
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('speaking');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('idle');
    };

    this.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopSpeaking();
    }
    return this.muted;
  }
}

export const speechService = new SpeechService();
