"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PillButton } from "./PillButton";

export function CameraModal({ isVisible, onSuccess, demoMode = false }) {
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      startCamera();
    }
    return () => stopTracks();
  }, [isVisible]);

  const stopTracks = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const startCamera = async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start countdown (0.5s in Demo)
      const targetTime = demoMode ? 0.5 : 3;
      let time = targetTime;
      const intervalDelay = demoMode ? 100 : 1000;
      setCountdown(Math.ceil(targetTime));
      
      const interval = setInterval(() => {
        time -= demoMode ? 0.1 : 1;
        if (time > 0) {
          setCountdown(Math.ceil(time));
        } else {
          clearInterval(interval);
          captureFrame(stream);
        }
      }, intervalDelay);
      
    } catch (err) {
      console.error("Camera fail:", err);
      setCapturing(false);
    }
  };

  const captureFrame = (stream) => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      stopTracks();
      setCapturing(false);
      onSuccess(blob);
    }, 'image/jpeg', 0.8);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
        >
          <div className="w-full max-w-sm aspect-video bg-gray-900 rounded-[var(--radius-card)] overflow-hidden relative border-2 border-teal/20 shadow-2xl shadow-teal/10">
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-dashed border-teal/30 rounded-full flex items-center justify-center">
                 {countdown !== null && (
                   <motion.span 
                    key={countdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-black text-white drop-shadow-lg"
                   >
                     {countdown}
                   </motion.span>
                 )}
              </div>
            </div>
          </div>
          <div className="mt-8 text-center px-4">
            <h2 className="text-xl font-bold text-white mb-2">Identity Verification</h2>
            <p className="text-white/60 text-sm">Keep your face centered in the frame for a quick 3-second capture.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
