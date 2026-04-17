"use client";

import { useEffect, useRef, useState } from "react";
import * as did from "@d-id/client-sdk";
import { Button } from "./button";
import { Card } from "./card";

/**
 * Real-time Voice-Interactive Agent Component
 */
export function RealtimeAgent({ sessionId, language, patientName, onConfirmTransition }) {
  const [agentManager, setAgentManager] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [isListening, setIsListening] = useState(false);
  const [consultationBlob, setConsultationBlob] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const DID_API_KEY = "a2FuYWtzaDg0QGdtYWlsLmNvbQ:0-B6lNhPznW3s_dyd7aHr";
  const AGENT_ID = "v2_agt_Cgmj5Ki0";

  // 1. Initialize Agent
  useEffect(() => {
    async function initAgent() {
      try {
        const auth = {
          type: "key",
          clientKey: DID_API_KEY
        };

        const callbacks = {
          onSrcObjectReady(stream) {
            console.log("[Agent] Stream ready");
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              startRecording(stream);
            }
          },
          onConnectionStateChange(state) {
            setConnectionState(state);
            console.log("[Agent] Connection:", state);
          },
          onNewMessage(messages) {
            console.log("[Agent] New message:", messages);
          },
          onError(error) {
            console.error("[Agent] SDK Error:", error);
          }
        };

        const manager = await did.createAgentManager(AGENT_ID, { auth, callbacks });
        setAgentManager(manager);
        await manager.connect();
      } catch (err) {
        console.error("[Agent] Init failed:", err);
      }
    }

    initAgent();

    return () => {
      if (agentManager) {
        agentManager.disconnect();
      }
      stopRecording();
    };
  }, []);

  // 2. STT Setup (Speech Recognition)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      console.log("[STT] Recognized:", transcript);
      if (agentManager && connectionState === "connected") {
        agentManager.chat(transcript);
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Automatically restart if still in education phase
      if (connectionState === "connected") recognition.start();
    };

    if (connectionState === "connected") {
      recognition.start();
    }

    return () => recognition.stop();
  }, [connectionState, agentManager, language]);

  // 3. Recording Logic (Phase 1 Audit)
  const startRecording = (stream) => {
    console.log("[Recorder] Starting consultation audit recording...");
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setConsultationBlob(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFinalConfirm = async () => {
    stopRecording();
    if (agentManager) {
      await agentManager.disconnect();
    }
    
    // Upload the consultation audit blob
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'consultation_audit.webm');
      formData.append('session_id', sessionId);
      formData.append('type', 'audit');

      await fetch('/api/consent/voice-save', {
        method: 'POST',
        body: formData
      });
    }

    onConfirmTransition();
  };

  return (
    <div className="space-y-6 relative">
      {/* Persistent Interrupt Button */}
      <div className="absolute top-0 right-0 z-50 p-4">
        <Button 
          onClick={handleFinalConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg animate-pulse"
        >
          Confirm Now & Sign ✓
        </Button>
      </div>

      <Card className="overflow-hidden border-2 border-purple-100 bg-slate-900 aspect-video relative">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlays */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-white text-xs font-medium uppercase tracking-widest">
            {connectionState === 'connected' ? 'Live Doctor Interaction' : 'Connecting...'}
          </span>
        </div>

        {isListening && connectionState === 'connected' && (
          <div className="absolute top-4 left-4 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            <span className="text-emerald-400 text-[10px] font-bold uppercase">Listening for questions...</span>
          </div>
        )}
      </Card>

      <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 text-center">
        <p className="text-sm text-purple-800 font-medium">
          "नमस्ते {patientName}, मैं आपकी डॉक्टर हूँ। क्या आपको इस सर्जरी के बारे में कुछ पूछना है?"
        </p>
      </div>
    </div>
  );
}
