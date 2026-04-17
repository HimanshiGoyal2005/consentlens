"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { Card } from "./card";

export function VoiceConfirmation({ sessionId, language, patientName, onSuccess }) {
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const prompt = language === 'Hindi' 
    ? `कृपया वीडियो चालू करें और कहें: "मेरा नाम ${patientName} है, और मुझे ऑपरेशन मंजूर है।"`
    : `Please record yourself saying: "My name is ${patientName}, and I consent to this operation."`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        setMediaUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to release camera
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      alert("Camera or Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleSave = async () => {
    if (!chunks.current.length) return;
    setUploading(true);

    try {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'confirmation_biometric.webm');
      formData.append('session_id', sessionId);
      formData.append('type', 'confirmation');

      const res = await fetch('/api/consent/voice-save', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onSuccess(data.hash);
    } catch (err) {
      alert("Failed to save confirmation: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-8 text-center bg-white border-2 border-dashed border-purple-200">
      <div className="space-y-6">
        <h4 className="text-slate-800 font-medium">{prompt}</h4>
        
        <div className="flex justify-center flex-col items-center gap-4">
          {!mediaUrl ? (
            <div className="relative w-full max-w-sm mx-auto aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }} // Mirror view for patient
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`w-20 h-20 rounded-full transition-all duration-300 z-10 ${
                    recording ? 'bg-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{recording ? '🛑' : '🎥'}</span>
                    <span className="text-[9px] uppercase font-bold text-white/90">
                      {recording ? 'Release' : 'Hold to Record'}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <div className="max-w-sm mx-auto aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 shadow-xl">
                <video src={mediaUrl} controls className="w-full h-full" />
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setMediaUrl(null)}>Retake</Button>
                <Button 
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                  onClick={handleSave}
                >
                  {uploading ? "Saving Record..." : "Confirm & Save Video"}
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-slate-400">
            {recording ? "Recording now..." : "Click and hold to record your video consent"}
          </p>
        </div>
      </div>
    </Card>
  );
}
