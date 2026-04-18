"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./button";
import { Card } from "./card";

/**
 * Stable High-Fidelity Voice Bot UI
 * Uses native browser STT + speechSynthesis, Gemini for AI response.
 */
export function VoiceBot({ 
  sessionId, 
  language, 
  patientName, 
  surgeryName, 
  onConfirmTransition,
  kinName,
  kinRelation
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const historyRef = useRef([]);

  const DOCTOR_IMAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/consent-videos/avatars/saree_doctor.png`;

  // Keep historyRef in sync for use inside callbacks
  historyRef.current = history;

  const getLangCode = (lang) => {
    switch (lang) {
      case 'Marathi': return 'mr-IN';
      case 'English': return 'en-US';
      case 'Hindi':
      case 'Bhojpuri':
      case 'Awadhi':
      default:
        return 'hi-IN';
    }
  };

  const code = getLangCode(language);
  const preferredLangPrefix = code.split('-')[0]; // 'hi', 'mr', 'en'

  // ─── Native TTS: Speak as Dr. Sharma ────────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(language);
    utterance.rate = 0.92;
    utterance.pitch = 1.1;

    // Pick the best voice
    const voices = window.speechSynthesis.getVoices();
    const prefix = getLangCode(language).split('-')[0];
    const voice = voices.find(v => v.lang.startsWith(prefix) && v.localService);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-restart mic after Dr. Sharma finishes
      setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) { }
        }
      }, 500);
    };

    setHistory(prev => [...prev, { role: 'assistant', content: text }]);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  // ─── Send patient speech to Gemini, then speak response ─────────────────────
  const handlePatientInput = useCallback(async (transcript) => {
    setHistory(prev => [...prev, { role: 'user', content: transcript }]);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language,
          surgeryName,
          history: historyRef.current
        })
      });

      const data = await res.json();
      if (data.text) speakText(data.text);
    } catch (err) {
      console.error("[VoiceBot] Chat error:", err);
      speakText(language === 'Hindi' ? "माफ करें, कोई तकनीकी समस्या है।" : "Sorry, there was a technical issue.");
    }
  }, [language, surgeryName, speakText]);

  // ─── Initialize Speech Recognition once ─────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[VoiceBot] Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLangCode(language);

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.warn("[STT] Error:", e.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("[STT] Patient said:", transcript);
      handlePatientInput(transcript);
    };

    recognitionRef.current = recognition;

    // Initial greeting via native TTS only (no API call)
    let greeting = "";
    if (kinName) {
      if (language === 'English') {
        greeting = `Hello ${kinName}. I understand you are the ${kinRelation} of ${patientName}. Since ${patientName} is unable to consent, I will guide you through the process as their legal representative.`;
      } else if (language === 'Marathi') {
        greeting = `नमस्कार ${kinName} जी. मला समजले आहे की तुम्ही ${patientName} चे ${kinRelation} आहात. ${patientName} संमती देण्यास असमर्थ असल्याने, मी तुम्हाला कायदेशीर प्रतिनिधी म्हणून मार्गदर्शन करेन.`;
      } else {
        greeting = `नमस्ते ${kinName} जी। मुझे पता है कि आप ${patientName} के ${kinRelation} हैं। चूँकि ${patientName} जी अभी संमती देने में असमर्थ हैं, इसलिए उनके प्रतिनिधि के रूप में मैं आपको इस प्रक्रिया के बारे में समझाऊँगी।`;
      }
    } else {
      if (language === 'English') {
        greeting = `Hello ${patientName}! I'm Dr. Sharma. Feel free to ask me anything about your ${surgeryName}.`;
      } else if (language === 'Marathi') {
        greeting = `नमस्कार ${patientName}! मी डॉ. शर्मा आहे. तुम्हाला तुमच्या ${surgeryName} बद्दल काही प्रश्न असल्यास विचारू शकता.`;
      } else {
        // Hindi, Bhojpuri, Awadhi
        greeting = `नमस्ते ${patientName} जी! मैं Dr. Sharma हूँ। आप ${surgeryName} के बारे में जो भी जानना चाहें, पूछ सकते हैं।`;
      }
    }

    // Delay to allow voices to load
    setTimeout(() => speakText(greeting), 800);

    return () => {
      recognition.abort();
      window.speechSynthesis.cancel();
    };
  }, [language, patientName, surgeryName, speakText, handlePatientInput]);

  // ─── Manual mic toggle ───────────────────────────────────────────────────────
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else if (!isSpeaking) {
      try { recognitionRef.current.start(); } catch (e) { }
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-8 animate-in fade-in duration-700">
      {/* Persistent Consent Button */}
      <div className="absolute -top-12 right-0">
        <Button
          onClick={onConfirmTransition}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-6 rounded-2xl shadow-xl animate-pulse flex items-center gap-2"
        >
          <span className="text-xl">✓</span>
          Proceed to Legal Consent
        </Button>
      </div>

      <div className="relative group">
        {/* Glow Effect */}
        <div className={`absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 blur-2xl transition-all duration-1000 ${isSpeaking || isListening ? 'opacity-40' : 'opacity-10'}`} />

        <Card className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl z-10 bg-slate-100">
          <img
            src={DOCTOR_IMAGE}
            alt="Dr. Sharma"
            className={`w-full h-full object-cover transition-transform duration-700 ${isSpeaking ? 'scale-105' : 'scale-100'}`}
          />
          {(isSpeaking || isListening) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex gap-1 items-end h-12">
                {[24, 36, 48, 32, 20].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-white rounded-full animate-bounce"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="text-center space-y-4 max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800">Talking to Dr. Sharma</h2>
        <p className="text-slate-500 text-sm italic">
          {isSpeaking ? "Doctor is explaining..." : isListening ? "Listening to you..." : "Tap the button below to ask a question"}
        </p>

        <div className="flex justify-center pt-4">
          <Button
            onClick={toggleListening}
            disabled={isSpeaking}
            className={`w-20 h-20 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 scale-110' : 'bg-purple-600 hover:bg-purple-700'
              } ${isSpeaking ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-lg hover:shadow-purple-200'}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{isListening ? '🛑' : '🎤'}</span>
              <span className="text-[9px] uppercase font-bold text-white/80">
                {isListening ? 'Stop' : 'Ask Question'}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Latest Transcription/Response Preview */}
      {history.length > 0 && (
        <Card className="p-4 bg-slate-50 border-slate-100 max-w-md w-full animate-in slide-in-from-bottom-4">
          <p className="text-sm text-slate-700">
            <span className="font-bold text-purple-600">
              {history[history.length - 1].role === 'user' ? 'You: ' : 'Dr. Sharma: '}
            </span>
            {history[history.length - 1].content}
          </p>
        </Card>
      )}
    </div>
  );
}
