"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PillButton } from "@/components/ui/PillButton";
import { Toast } from "@/components/ui/Toast";
import { apiPost } from "@/lib/apiPost";
import { getSurgeryConfig } from "@/lib/surgeryConfigs";

export default function PatientEducationPage() {
  const { session_id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [session, setSession] = useState(null);
  const [config, setConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Intro, 1-5 = Risks, 6 = Summary
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(searchParams.get("demo") === "true");
  const [toast, setToast] = useState(null);

  // Demo Activation (5 taps)
  const tapCount = useRef(0);
  const lastTap = useRef(0);

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 400) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTap.current = now;

    if (tapCount.current >= 5) {
      setDemoMode(true);
      setToast({ message: "Demo Mode Activated 🚀", type: "success" });
      tapCount.current = 0;
    }
  };

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase
        .from("consent_sessions")
        .select("*")
        .eq("session_id", session_id)
        .single();

      if (error || !data) {
        console.error("Session fetch failed:", error);
        return;
      }

      setSession(data);
      setConfig(getSurgeryConfig(data.surgery_id));
      
      // If Kin Consent, skip to finalization step
      if (data.consent_actor === "kin") {
        setCurrentStep(6);
      }
      
      setLoading(false);
    }
    init();
  }, [session_id]);

  const handleNext = async (understood = true) => {
    // Log response to backend (offline-ready)
    await apiPost("/api/consent/response", {
      session_id,
      risk_index: currentStep,
      response_type: understood ? "understood" : "replay_requested",
      timestamp: new Date().toISOString()
    });

    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push(`/p/${session_id}/complete`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading Education Module...</div>
      </div>
    );
  }

  const progress = (currentStep / 6) * 100;
  const currentRisk = currentStep > 0 && currentStep <= 5 ? config.risks[currentStep - 1] : null;

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col safe-area-inset">
      {/* Premium Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div onClick={handleLogoTap} className="flex items-center gap-2 select-none cursor-pointer active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold font-serif">CL</span>
          </div>
          <span className="font-semibold tracking-tight">ConsentLens</span>
        </div>
        {session?.consent_actor === "kin" && (
          <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold border border-red-500/30">
            EMERGENCY BYPASS
          </div>
        )}
        {demoMode && !session?.consent_actor === "kin" && (
          <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold border border-amber-500/30 animate-pulse">
            DEMO MODE
          </div>
        )}
      </header>

      {/* Emergency Kin Alert */}
      {session?.consent_actor === "kin" && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 animate-in zoom-in duration-500">
           <div className="flex items-center gap-3 text-red-400 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-sm tracking-wide uppercase">Kin Consent Required</h3>
           </div>
           <p className="text-xs text-red-300/80 leading-relaxed">
             You are providing medical consent for <strong>{session.patient_name}</strong> as their <strong>{session.kin_relation}</strong> because the patient is currently unable to consent.
           </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <ProgressBar progress={progress} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {currentStep === 0 ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, <span className="text-blue-500">{session.patient_name}</span>.
            </h1>
            <p className="text-gray-400 leading-relaxed text-lg">
              We will now walk you through the details of your <span className="text-white font-medium">{config.name}</span>.
              Please watch each video carefully.
            </p>
            <div className="aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
               <VideoPlayer 
                  src="/videos/intro_general.mp4" 
                  demoMode={demoMode}
                  onEnded={() => {}}
                />
            </div>
            <PillButton onClick={() => handleNext()} className="w-full h-16 text-lg font-bold">
              Start Learning
            </PillButton>
          </div>
        ) : currentStep <= 5 ? (
          <div className="space-y-6 flex-1 flex flex-col">
            <div>
              <span className="text-blue-500 font-mono text-sm tracking-widest uppercase">Risk {currentStep} of 5</span>
              <h2 className="text-2xl font-bold mt-1">{currentRisk.title}</h2>
            </div>
            
            <div className="aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl flex-1">
              {/* In a real app, src would dynamically point to the generated D-ID video or a placeholder */}
              <VideoPlayer 
                src={`/videos/risk_${currentStep}.mp4`} 
                demoMode={demoMode}
                onEnded={() => {}}
              />
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 italic text-gray-300">
              "{currentRisk.description}"
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleNext(false)}
                className="h-16 rounded-2xl border border-white/10 bg-white/5 font-semibold active:bg-white/10 transition-colors"
              >
                Replay
              </button>
              <PillButton onClick={() => handleNext(true)} className="h-16 text-lg font-bold">
                I Understand
              </PillButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8 flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">All Risks Reviewed</h2>
            <p className="text-gray-400 text-lg">
              You have completed the educational section. Next, we will verify your identity to finalize the consent.
            </p>
            <PillButton onClick={() => handleNext()} className="w-full h-16 text-lg font-bold">
              Finalize Consent
            </PillButton>
          </div>
        )}
      </main>

      {/* Toast Notification */}
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
