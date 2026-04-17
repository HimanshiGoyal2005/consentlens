"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PatientInteractionFlow } from "@/components/ui/PatientInteractionFlow";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const SURGERY_NAMES = {
  appendix_lap: "Laparoscopic Appendectomy",
  knee_replace: "Total Knee Replacement",
  cataract: "Cataract Surgery",
  cholecystectomy: "Gallbladder Removal / Cholecystectomy",
  hernia_repair: "Hernia Repair",
  // ... and the rest from dashboard/NewConsentForm if needed
};

export default function DoctorSessionPage() {
  const { session_id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
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
      setLoading(false);
    }
    fetchSession();
  }, [session_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4FF]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5B4FCF]"></div>
      </div>
    );
  }

  const surgeryName = SURGERY_NAMES[session.surgery_id] || session.surgery_id;

  return (
    <div className="min-h-screen bg-[#F5F4FF] p-6 lg:p-12" style={{ color: "#1A1A2E" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link href="/dashboard">
                <img src="/logo-horizontal.svg" alt="Logo" className="h-6" />
             </Link>
             <span className="text-slate-300">|</span>
             <span className="text-sm font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Session
             </span>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-[#5B4FCF] transition-colors">
            Back to Dashboard
          </Link>
        </div>

        {/* Emergency Info Bar */}
        <Card className="p-4 border-red-100 bg-red-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Emergency Reason</p>
              <p className="text-sm font-medium text-slate-900">{session.emergency_reason || "Not specified"}</p>
           </div>
           <div className="h-8 w-px bg-red-100 hidden md:block" />
           <div>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Consenting Kin</p>
              <p className="text-sm font-medium text-slate-900">{session.kin_name} ({session.kin_relation})</p>
           </div>
           <div className="h-8 w-px bg-red-100 hidden md:block" />
           <div>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Patient Name</p>
              <p className="text-sm font-medium text-slate-900">{session.patient_name}</p>
           </div>
        </Card>

        {/* Interaction Flow */}
        <PatientInteractionFlow
          sessionId={session_id}
          language={session.language}
          patientName={session.patient_name}
          surgeryName={surgeryName}
          videoUrl={null}
          consentActor="kin"
          kinName={session.kin_name}
          kinRelation={session.kin_relation}
          emergencyReason={session.emergency_reason}
        />
        
        <div className="text-center pt-4">
           <p className="text-xs text-slate-400">
             Audit Trail enabled. Consent actor is recorded as 'kin'. 
             C2PA signing will reference <strong>{session.kin_name}</strong>.
           </p>
        </div>
      </div>
    </div>
  );
}
