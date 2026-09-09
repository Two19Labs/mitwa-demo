/**
 * Web Speech API Service
 * Handles Speech-to-Text (SpeechRecognition) and Text-to-Speech (SpeechSynthesis)
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.muted = false;
    this.selectedLanguage = 'en-IN'; // 'en-IN' or 'hi-IN'
    this.voices = [];
    this.onResultCallback = null;
    this.onStatusChangeCallback = null;
    this.onSpeakStartCallback = null;
    this.onSpeakEndCallback = null;
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;

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
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Turn-based for precision dialog
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
        console.warn('Speech recognition error:', event.error);
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
      // If already started, ignore or abort and retry
      if (err.name !== 'InvalidStateError') {
        console.warn('Recognition start error:', err);
      }
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

  speak(text, onStart, onEnd) {
    if (!this.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    if (this.muted) {
      if (onEnd) onEnd();
      return;
    }

    // Temporarily pause recognition to prevent Mitwa from talking to itself
    this.stopListening();
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick best matching voice
    if (this.voices.length === 0) {
      this.voices = this.speechSynthesis.getVoices();
    }

    const indianVoice = this.voices.find(v => 
      (v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('google हिन्दी'))
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
