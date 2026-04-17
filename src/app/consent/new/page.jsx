"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { PatientInteractionFlow } from "@/components/ui/PatientInteractionFlow";

const SURGERIES = [
  { id: "appendix_lap", label: "Laparoscopic Appendectomy" },
  { id: "knee_replace", label: "Total Knee Replacement" },
  { id: "cataract", label: "Cataract Surgery" },
];

const LANGUAGES = ["Bhojpuri", "Maithili", "Hindi", "Awadhi", "Marathi"];

const HINDI_LABELS = {
  surgery: "Aapreyshan",
  patientName: "Rogee Ka Naam",
  patientId: "Rogee Ka Anumati Patra",
  bedNumber: "Bistar Sankhya",
  language: "Bhasha",
  kinPhone: "Sambandhit Ka Phone",
  doctorId: "Daktar Ki ID",
};

export default function NewConsentPage() {
  const [formData, setFormData] = useState({
    surgery: "",
    patientName: "",
    patientId: "",
    bedNumber: "",
    language: "Hindi",
    kinPhone: "",
    doctorId: "",
  });

  const [state, setState] = useState("form"); // 'form', 'loading', 'success', 'error'
  const [sessionId, setSessionId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  // Load doctor ID from localStorage on mount
  useEffect(() => {
    const savedDoctorId = localStorage.getItem("doctorId");
    if (savedDoctorId) {
      setFormData((prev) => ({ ...prev, doctorId: savedDoctorId }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pollSession = useCallback(async (sid) => {
    try {
      const response = await fetch(`/api/consent/session/${sid}`);
      if (!response.ok) throw new Error("Failed to fetch session");

      const data = await response.json();
      setPollCount((prev) => prev + 1);

      // API returns { session: { status, video_url, ... } }
      if (data.session && data.session.status === "ready") {
        setVideoUrl(data.session.video_url);
        setState("success");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Polling error:", err);
      // We don't set global error here to keep polling trying
      return false;
    }
  }, []);

  useEffect(() => {
    if (state !== "loading" || !sessionId) return;

    // Initial check in case it's already ready
    const pollInterval = setInterval(async () => {
      const isReady = await pollSession(sessionId);
      if (isReady) {
        clearInterval(pollInterval);
      }
    }, 3000); // 3 seconds is better for demo

    return () => clearInterval(pollInterval);
  }, [state, sessionId, pollSession]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.surgery ||
      !formData.patientName ||
      !formData.patientId ||
      !formData.bedNumber ||
      !formData.language ||
      !formData.kinPhone ||
      !formData.doctorId
    ) {
      setError("Please fill all fields");
      setState("error");
      return;
    }

    // Immediately move to consultation (Voice Bot)
    // No need to wait for D-ID generation since we switched to Live Voice Bot
    const mockSessionId = `sess_${Date.now()}`;
    setSessionId(mockSessionId);
    setState("success");
  };

  const handleRetry = () => {
    setState("form");
    setSessionId(null);
    setError(null);
    setPollCount(0);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12"
      style={{ backgroundColor: "#F5F4FF" }}
    >
      <Card className={`${state === 'success' ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}>
        {/* Header */}
        <div
          className="px-6 py-4 border-b text-center rounded-t-xl"
          style={{ backgroundColor: "#5B4FCF", borderColor: "#E0E0E0" }}
        >
          <h1 className="text-xl font-bold text-white">
            ConsentLens
          </h1>
          <p style={{ color: "#E8E8F0", fontSize: "0.875rem" }}>
            {state === 'success' ? 'Patient Interactive Education' : 'Doctor Portal'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {state === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Surgery */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Surgery
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.surgery}
                </p>
                <select
                  name="surgery"
                  value={formData.surgery}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: "#D4D4E0",
                    backgroundColor: "white",
                    color: "#1A1A2E",
                  }}
                >
                  <option value="">Select Surgery</option>
                  {SURGERIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ... REST OF FORM ... */}
              {/* (Assuming standard form fields below, I'll keep them as is) */}
              
              {/* Patient Name */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Patient Name</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.patientName}</p>
                <Input name="patientName" value={formData.patientName} onChange={handleInputChange} placeholder="Enter name" />
              </div>

              {/* Patient ID */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Patient ID</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.patientId}</p>
                <Input name="patientId" value={formData.patientId} onChange={handleInputChange} placeholder="Hospital ID" />
              </div>

              {/* Bed Number */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Bed Number</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.bedNumber}</p>
                <Input name="bedNumber" value={formData.bedNumber} onChange={handleInputChange} placeholder="Bed #" />
              </div>

              {/* Language */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Language</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.language}</p>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Kin Phone */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Kin Phone (WhatsApp)</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.kinPhone}</p>
                <Input name="kinPhone" value={formData.kinPhone} onChange={handleInputChange} placeholder="+91..." />
              </div>

              {/* Doctor ID */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Doctor ID</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.doctorId}</p>
                <Input name="doctorId" value={formData.doctorId} onChange={handleInputChange} placeholder="DOC_ID" />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full font-bold py-6 bg-[#5B4FCF] text-white rounded-2xl shadow-lg hover:bg-[#4B3FBF] transition-all"
              >
                Start AI Consultation
              </Button>

              <div className="text-center">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm text-[#5B4FCF]">Back to Dashboard</Button>
                </Link>
              </div>
            </form>
          )}

          {state === "loading" && (
            <div className="text-center space-y-6 py-8">
              <div
                className="inline-block w-12 h-12 border-4 border-t-4 rounded-full animate-spin"
                style={{ borderColor: "#E0E0E0", borderTopColor: "#5B4FCF" }}
              />
              <div className="space-y-2">
                <p className="font-bold text-slate-800">Generating Patient Consent Video...</p>
                <p className="text-sm text-slate-500">AI is translating risks into {formData.language}</p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                <div 
                  className="h-full bg-[#5B4FCF] transition-all duration-500"
                  style={{ width: `${Math.min(pollCount * 10, 95)}%` }}
                />
              </div>
            </div>
          )}

          {state === "success" && (
            <PatientInteractionFlow 
              sessionId={sessionId} 
              videoUrl={videoUrl} 
              language={formData.language}
              patientName={formData.patientName}
              surgeryName={SURGERIES.find(s => s.id === formData.surgery)?.label || "Surgery"}
            />
          )}

          {state === "error" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-500 text-3xl">!</div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Generation Failed</h2>
                <p className="text-sm text-red-500">{error}</p>
              </div>
              <Button onClick={handleRetry} className="w-full bg-[#5B4FCF] text-white">Try Again</Button>
              <Link href="/dashboard" className="block text-sm text-[#5B4FCF] hover:underline">Back to Dashboard</Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
