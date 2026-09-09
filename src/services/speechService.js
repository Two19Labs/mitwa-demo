/**
 * Web Speech & Neural Indian Voice Service
 * Powered by Microsoft Azure Edge Neural Voices (hi-IN-SwaraNeural & hi-IN-MadhurNeural)
 * Produces 100% authentic, human-grade Hindi and Hinglish pronunciation.
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.muted = false;
    this.currentAudio = null;
    this.voiceMode = 'swara_hindi'; // 'swara_hindi' | 'madhur_hindi' | 'neerja_english' | 'browser_native'
    this.selectedLanguage = 'hi-IN';
    this.onResultCallback = null;
    this.onStatusChangeCallback = null;
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];

    this.initRecognition();
    this.loadVoices();
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
   * Speak with Neural Indian Accent
   */
  speak(textOptions, onStart, onEnd) {
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

    // If browser_native selected explicitly
    if (this.voiceMode === 'browser_native') {
      this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
      return;
    }

    // Map to Azure Edge Neural Voices
    let voiceParam = 'hi-IN-SwaraNeural';
    let textToSend = phoneticHindi || spokenText;

    if (this.voiceMode === 'madhur_hindi') {
      voiceParam = 'hi-IN-MadhurNeural';
      textToSend = phoneticHindi || spokenText;
    } else if (this.voiceMode === 'neerja_english') {
      voiceParam = 'en-IN-NeerjaNeural';
      textToSend = spokenText;
    } else {
      // Default: Swara Neural (Highest quality Hindi female voice)
      voiceParam = 'hi-IN-SwaraNeural';
      textToSend = phoneticHindi || spokenText;
    }

    try {
      const url = `/api/tts?voice=${encodeURIComponent(voiceParam)}&text=${encodeURIComponent(textToSend)}`;
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

      audio.onerror = (err) => {
        console.warn('Audio endpoint playback error, fallback to browser TTS:', err);
        this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
      };

      audio.play().catch(err => {
        console.warn('Direct play error:', err);
        this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
      });
    } catch (e) {
      console.warn('TTS streaming exception:', e);
      this.fallbackBrowserSpeak(spokenText, onStart, onEnd);
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
