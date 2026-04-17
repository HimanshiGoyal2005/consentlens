"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Camera, Video, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export function VoiceConfirmation({ 
  sessionId, 
  language, 
  patientName, 
  surgeryName,
  onSuccess,
  kinName,
  kinRelation
}) {
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("initializing"); // initializing, ready, error
  const [errorMessage, setErrorMessage] = useState(null);

  const mediaRecorder = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);

  const prompts = {
    'English': kinName 
      ? `Please record yourself saying: "I, ${kinName}, ${kinRelation} of ${patientName}, understand and consent to ${surgeryName || 'this procedure'}."`
      : `Please record yourself saying: "My name is ${patientName}, and I consent to this operation."`,
    'Marathi': kinName
      ? `कृपया व्हिडिओ चालू करा आणि म्हणा: "मी, ${kinName}, ${patientName} चे ${kinRelation}, ${surgeryName || 'ह्या शस्त्रक्रियेला'} समजून संमती देतो/देते."`
      : `कृपया व्हिडिओ चालू करा आणि म्हणा: "माझे नाव ${patientName} आहे, आणि मला या ऑपरेशनला संमती आहे."`,
    'Hindi': kinName
      ? `कृपया वीडियो चालू करें और कहें: "मैं, ${kinName}, ${patientName} के ${kinRelation}, ${surgeryName || 'इस ऑपरेशन'} के लिए अपनी पूरी समझ से संमती देता हूँ/देती हूँ।"`
      : `कृपया वीडियो चालू करें और कहें: "मेरा नाम ${patientName} है, और मुझे ऑपरेशन मंजूर है।"`,
    'Bhojpuri': kinName
      ? `कृपया वीडियो चालू करीं आउर कहीं: "हम, ${kinName}, ${patientName} के ${kinRelation}, ${surgeryName || 'ई ऑपरेशन'} खातिर आपन मंजूरी देत बानी।" `
      : `कृपया वीडियो चालू करीं आउर कहीं: "हमर नाम ${patientName} बा, आउर हमरा ई ऑपरेशन मंजूर बा।"`,
    'Awadhi': kinName
      ? `कृपया वीडियो चालू करौ अउर कहौ: "हम, ${kinName}, ${patientName} के ${kinRelation}, ${surgeryName || 'ई ऑपरेशन'} बरे आपन मंजूरी देत अही।" `
      : `कृपया वीडियो चालू करौ अउर कहौ: "हमरे नाम ${patientName} आय, अअउर हमका ई ऑपरेशन मंजूर बाय।"`
  };
  const prompt = prompts[language] || prompts['Hindi'];

  // 1. Setup Camera Stream
  useEffect(() => {
    async function setupCamera() {
      try {
        // Use simpler constraints for maximum compatibility across mid-range devices
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true
        });
        streamRef.current = stream;
        setCameraStatus("ready");
      } catch (err) {
        console.error("Camera access denied", err);
        setCameraStatus("error");
        setErrorMessage("Camera or microphone access was blocked. Please enable permissions in your browser settings to proceed with biometric consent.");
      }
    }
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Ref Callback: This is the most robust way to attach a stream to a video element
  // It triggers immediately when the element enters the DOM, preventing "black screens"
  const setVideoRef = useCallback((node) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.onloadedmetadata = () => {
        node.play().catch(e => console.warn("Autoplay blocked", e));
      };
    }
  }, [cameraStatus, mediaUrl]); // Re-attach if camera becomes ready or we toggle back from preview

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunks.current = [];

    // Choose a universally supported type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';

    try {
      mediaRecorder.current = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType });
        setMediaUrl(URL.createObjectURL(blob));
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
      setErrorMessage("Could not start recording. This device might not support the required video format.");
      setCameraStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleRetake = () => {
    setMediaUrl(null);
    chunks.current = [];
  };

  const handleSave = async () => {
    if (!chunks.current.length) return;
    setUploading(true);
    try {
      const blob = new Blob(chunks.current, { type: mediaRecorder.current?.mimeType || 'video/webm' });
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const formData = new FormData();
      formData.append('audio', blob, `confirmation_biometric.${extension}`);
      formData.append('session_id', sessionId);
      formData.append('type', 'confirmation');

      const res = await fetch('/api/consent/voice-save', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onSuccess(data.hash);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("Failed to secure biometric record: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (cameraStatus === "error") {
    return (
      <Card className="p-12 text-center bg-red-50/50 border-2 border-red-100 max-w-2xl mx-auto shadow-2xl rounded-[3rem] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 text-red-600">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight">Security Access Required</h2>
            <p className="text-red-700/80 font-medium leading-relaxed max-w-md">{errorMessage}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-200">
            Refresh & Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 perspective-1000">
      <Card className="p-0 border-none bg-transparent overflow-visible">
        <div className="glass-morphism rounded-[3rem] border border-white/40 shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] bg-white/70 backdrop-blur-2xl relative overflow-hidden">

          {/* Animated Background Gradient */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

          {/* Header Section */}
          <div className="px-8 pt-12 pb-6 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Digital Signature
            </div>
            <h4 className="text-3xl font-black text-slate-900 leading-[1.1] tracking-tight max-w-2xl mx-auto">
              {prompt}
            </h4>
          </div>

          <div className="p-2 sm:p-10 relative z-10">
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] bg-slate-950 border-[6px] border-white aspect-video max-w-3xl mx-auto transition-transform duration-500 hover:scale-[1.01]">
              {!mediaUrl ? (
                <>
                  <video
                    ref={setVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover mirror opacity-0 transition-opacity duration-1000"
                    style={{ opacity: cameraStatus === "ready" ? 1 : 0 }}
                  />

                  {cameraStatus === "initializing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-white/50">
                      <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Activating Bio-Metrics...</span>
                    </div>
                  )}

                  {cameraStatus === "ready" && (
                    <>
                      <div className="absolute inset-x-0 bottom-0 p-10 flex justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <Button
                          onClick={toggleRecording}
                          className={`h-24 w-24 rounded-full transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] relative flex items-center justify-center group ${recording
                              ? 'bg-red-600 hover:bg-red-700 scale-110'
                              : 'bg-white hover:bg-indigo-50 hover:scale-105'
                            }`}
                        >
                          {recording ? (
                            <div className="w-8 h-8 bg-white rounded-md animate-pulse" />
                          ) : (
                            <div className="w-10 h-10 bg-red-600 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-red-200" />
                          )}

                          {/* Label */}
                          <div className={`absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${recording ? 'bg-red-600 text-white animate-bounce' : 'bg-white text-slate-900'
                            }`}>
                            {recording ? 'Recording' : 'Start Sign'}
                          </div>
                        </Button>
                      </div>

                      {recording && (
                        <div className="absolute top-8 left-8">
                          <div className="flex items-center gap-3 bg-red-600/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase animate-pulse shadow-2xl">
                            <div className="w-2.5 h-2.5 bg-white rounded-full translate-y-[0.5px]" />
                            Live Audit
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="relative w-full h-full group/preview">
                  <video src={mediaUrl} controls playsInline className="w-full h-full object-cover" />
                  <div className="absolute top-8 left-8">
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-2xl flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Verification Ready
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Container */}
            <div className="mt-12 flex flex-col items-center gap-6">
              {mediaUrl ? (
                <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1 h-16 rounded-[1.5rem] border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] gap-3 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Discard & Retake
                  </Button>
                  <Button
                    disabled={uploading}
                    onClick={handleSave}
                    className="flex-[1.5] h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95 active:shadow-none"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-indigo-200" />
                        Finalize Digital Proof
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {recording ? "Speak clearly into the microphone" : "Ensure your face is clearly visible"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">C2PA Standardized</p>
                <p className="text-[9px] font-medium text-slate-400">Cryptographically signed video metadata</p>
              </div>
            </div>
            <div className="h-px w-12 bg-slate-200 hidden sm:block" />
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Zero-Trust Protocol</p>
              <p className="text-[9px] font-medium text-slate-400">Encrypted transmission active</p>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
