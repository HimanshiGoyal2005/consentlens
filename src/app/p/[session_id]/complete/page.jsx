"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PillButton } from "@/components/ui/PillButton";
import { CameraModal } from "@/components/ui/CameraModal";
import { Toast } from "@/components/ui/Toast";

export default function ConsentCompletionPage() {
  const { session_id } = useParams();
  const router = useRouter();

  // State
  const [session, setSession] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const { data } = await supabase
        .from("consent_sessions")
        .select("*")
        .eq("session_id", session_id)
        .single();
      setSession(data);
    }
    fetchSession();
  }, [session_id]);

  const handleCapture = async (blob) => {
    setIsVerifying(true);
    setShowCamera(false);

    // Mock verification delay
    setTimeout(async () => {
      setIsVerified(true);
      setIsVerifying(false);
      setToast({ message: "Identity Verified Successfully", type: "success" });
      
      // Update session status in background
      await supabase
        .from("consent_sessions")
        .update({ status: "completed", verified_at: new Date().toISOString() })
        .eq("session_id", session_id);
        
      // Log Push ACK to backend
      fetch('/api/push/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, status: 'completed' })
      });
    }, 2000);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleNotifyNurse = async () => {
    setToast({ message: "Notifying Nurse...", type: "info" });
    const res = await fetch('/api/notify/nurse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id })
    });
    if (res.ok) {
      setToast({ message: "Nurse has been notified", type: "success" });
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col p-6 items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {!isVerified ? (
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Final Step</h1>
            <p className="text-gray-400 text-lg">
              To finalize your legal consent, we need to verify your identity through a quick face capture.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-square rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-8 space-y-4 overflow-hidden">
              {isVerifying ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-500 font-medium animate-pulse">Running Biometric Check...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Position your face within the frame</p>
                </>
              )}
            </div>
          </div>

          <PillButton 
            onClick={() => setShowCamera(true)} 
            className="w-full h-16 text-lg font-bold"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Identity"}
          </PillButton>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 mx-auto shadow-[0_0_50px_rgba(34,197,94,0.2)]">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Consent Complete</h1>
            <p className="text-gray-400 text-lg">
              Thank you, <span className="text-white font-medium">{session?.patient_name}</span>. Your surgical consent has been digitally signed and verified.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <PillButton onClick={handleBackToHome} className="w-full h-16 text-lg font-bold">
              Done
            </PillButton>
            
            <button 
              onClick={handleNotifyNurse}
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 font-semibold text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notify Nurse
            </button>
          </div>
        </div>
      )}

      {/* Modals & Toasts */}
      {showCamera && (
        <CameraModal 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
