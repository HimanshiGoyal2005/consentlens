"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { PatientInteractionFlow } from "@/components/ui/PatientInteractionFlow";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const SURGERIES = [
  // GENERAL SURGERY
  { id: "cholecystectomy", label: "Gallbladder Removal / Cholecystectomy" },
  { id: "hernia_repair", label: "Hernia Repair" },
  { id: "hydrocele", label: "Hydrocele Surgery" },
  { id: "piles", label: "Piles / Hemorrhoids Surgery" },
  { id: "fistula", label: "Fistula Surgery" },
  { id: "abscess_drainage", label: "Abscess Drainage" },
  { id: "lipoma", label: "Lipoma Excision" },
  { id: "circumcision", label: "Circumcision" },
  { id: "thyroidectomy", label: "Thyroid Removal / Thyroidectomy" },
  { id: "appendix_lap", label: "Laparoscopic Appendectomy" },

  // OBSTETRICS & GYNAE
  { id: "normal_delivery", label: "Normal Delivery" },
  { id: "lscs", label: "C-Section / LSCS" },
  { id: "dnc", label: "D&C / Dilatation & Curettage" },
  { id: "tubectomy", label: "Tubectomy / Nasbandi" },
  { id: "hysterectomy", label: "Bacchedani ka Operation / Hysterectomy" },
  { id: "mtp", label: "MTP / Medical Abortion" },
  { id: "ectopic", label: "Ectopic Pregnancy Surgery" },

  // ORTHOPEDIC
  { id: "knee_replace", label: "Total Knee Replacement" },
  { id: "fracture_fix", label: "Fracture Fixation / Rod-Plating" },
  { id: "thr", label: "Total Hip Replacement" },
  { id: "arthroscopy", label: "Arthroscopy / Knee Camera" },
  { id: "spine_surgery", label: "Spine Surgery" },
  { id: "acl_repair", label: "ACL Repair / Ligament Surgery" },
  { id: "shoulder_replace", label: "Shoulder Replacement" },

  // CARDIAC
  { id: "angiography", label: "Angiography" },
  { id: "angioplasty", label: "Angioplasty + Stent" },
  { id: "cabg", label: "Bypass Surgery / CABG" },
  { id: "pacemaker", label: "Pacemaker Implant" },
  { id: "valve_replace", label: "Valve Replacement" },
  { id: "asd_closure", label: "ASD Closure" },

  // NEURO
  { id: "craniotomy", label: "Craniotomy / Brain Surgery" },
  { id: "spine_tumor", label: "Spine Tumor Removal" },
  { id: "vp_shunt", label: "VP Shunt" },
  { id: "epilepsy_surgery", label: "Epilepsy Surgery" },
  { id: "brain_biopsy", label: "Brain Biopsy" },

  // ENT
  { id: "tonsillectomy", label: "Tonsil Removal / Tonsillectomy" },
  { id: "adenoidectomy", label: "Adenoid Removal" },
  { id: "septoplasty", label: "Septoplasty / Naak ki Haddi" },
  { id: "fess", label: "FESS / Sinus Surgery" },
  { id: "myringotomy", label: "Ear Drum Surgery / Myringotomy" },
  { id: "mastoidectomy", label: "Mastoidectomy" },

  // OPHTHAL
  { id: "cataract", label: "Cataract Surgery" },
  { id: "glaucoma", label: "Glaucoma Surgery / Kaala Motia" },
  { id: "retinal_detachment", label: "Retinal Detachment Surgery" },
  { id: "lasik", label: "LASIK / Chashma Hatana" },
  { id: "squint", label: "Squint Correction / Bhengaapan" },
  { id: "pterygium", label: "Pterygium Removal" },

  // UROLOGY
  { id: "pcnl", label: "Kidney Stone / PCNL" },
  { id: "turp", label: "TURP / Prostate Surgery" },
  { id: "cystoscopy", label: "Cystoscopy / Bladder Camera" },
  { id: "varicocele", label: "Varicocele Surgery" },
  { id: "vasectomy", label: "Vasectomy / Nasbandi Male" },
  { id: "nephrectomy", label: "Kidney Removal / Nephrectomy" },

  // ONCOLOGY
  { id: "mastectomy", label: "Mastectomy / Breast Removal" },
  { id: "lumpectomy", label: "Lumpectomy / Breast Lump" },
  { id: "colon_resection", label: "Colon Cancer Surgery" },
  { id: "oral_cancer", label: "Oral Cancer Surgery" },

  // PEDIATRIC
  { id: "cleft_lip", label: "Cleft Lip / Kata Honth" },
  { id: "congenital_hernia", label: "Congenital Hernia" },
  { id: "undescended_testis", label: "Undescended Testis" },
  { id: "pda_ligation", label: "PDA Ligation" },

  // DENTAL
  { id: "rct", label: "Root Canal Treatment / RCT" },
  { id: "extraction", label: "Tooth Extraction / Daant Nikalna" },
  { id: "implant", label: "Dental Implant" },
  { id: "jaw_fracture", label: "Jaw Fracture Fixation" },
  { id: "wisdom_tooth", label: "Wisdom Tooth Removal" },

  // PLASTIC
  { id: "burn_contracture", label: "Burn Contracture Release" },
  { id: "skin_graft", label: "Skin Graft" },
  { id: "scar_revision", label: "Scar Revision" },
  { id: "rhinoplasty", label: "Rhinoplasty / Naak Surgery" },

  // EMERGENCY
  { id: "trauma_lap", label: "Trauma Laparotomy" },
  { id: "emergency_craniotomy", label: "Emergency Craniotomy" },
  { id: "emergency_lscs", label: "Emergency C-Section" },
  { id: "vascular_repair", label: "Vascular Repair" },
  { id: "splenectomy", label: "Spleen Removal / Splenectomy" },
];

const LANGUAGES = ["Bhojpuri", "English", "Hindi", "Awadhi", "Marathi"];

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

    // Emergency fields
    emergencyReason: "",
    kinName: "",
    kinRelation: "",
  });

  const [state, setState] = useState("form"); // 'form', 'loading', 'success', 'error'
  const [emergency, setEmergency] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const currentDocId = formData.doctorId || localStorage.getItem("doctorId") || "DEMO_DOC_001";
    const commonFields = formData.surgery && formData.patientName && formData.language && currentDocId;
    
    if (emergency) {
      if (!commonFields || !formData.emergencyReason || !formData.kinName || !formData.kinRelation) {
         setError("Required: Emergency Reason, Kin Name, and Relation");
         return;
      }
    } else {
      if (!commonFields || !formData.patientId || !formData.bedNumber) {
        setError("Please fill all patient and surgery fields");
        return;
      }
    }

    setState("loading");

    try {
      if (emergency) {
        // Emergency Path: POST to specialized endpoint
        const response = await fetch('/api/emergency/kin-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surgery_id: formData.surgery,
            patient_name: formData.patientName,
            patient_id: formData.patientId || "EMERGENCY",
            bed_number: formData.bedNumber || "EMRG",
            language: formData.language,
            doctor_id: currentDocId,
            emergency_reason: formData.emergencyReason,
            kin_name: formData.kinName,
            kin_phone: formData.kinPhone,
            kin_relation: formData.kinRelation
          })
        });

        if (!response.ok) throw new Error("Emergency session creation failed");
        
        const data = await response.json();
        setSessionId(data.session_id);
        setState("success");
      } else {
        // Normal Path: Standard generation
        const response = await fetch('/api/consent/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surgery_id: formData.surgery,
            patient_id: formData.patientId,
            patient_name: formData.patientName,
            bed_number: formData.bedNumber,
            language: formData.language,
            kin_phone: formData.kinPhone,
            doctor_id: formData.doctorId
          })
        });

        if (!response.ok) throw new Error("Consent generation failed");
        
        const data = await response.json();
        setSessionId(data.session_id);
        setState("success");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
      setState("error");
    }
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
      style={{ backgroundColor: "#F5F4FF", color: "#1A1A2E" }}
      suppressHydrationWarning
    >
      <Card className={`${state === 'success' ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}>
        {/* Header */}
        <div
          className={`px-6 py-4 border-b text-center rounded-t-xl overflow-hidden transition-colors ${emergency ? 'bg-red-600' : 'bg-[#5B4FCF]'}`}
          style={{ borderColor: "#E0E0E0" }}
        >
          <div className="flex justify-center mb-1">
             <img src="/logo-horizontal.svg" alt="ConsentLens" className="h-6 brightness-0 invert" />
          </div>
          <p style={{ color: "#E8E8F0", fontSize: "0.875rem" }}>
            {emergency ? 'Emergency Consent - Kin Required' : (state === 'success' ? 'Interactive Consent Session' : 'Doctor Portal')}
          </p>
        </div>

        {/* Emergency Toggle */}
        {state === 'form' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Emergency Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setEmergency(!emergency)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emergency ? 'bg-red-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emergency ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {state === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              {/* Emergency Reason */}
              {emergency && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm font-medium text-red-700">Emergency Reason (Required)</Label>
                  <p className="text-xs text-red-500/70 mb-2">Ghamand Kaaran</p>
                  <Input 
                    name="emergencyReason" 
                    value={formData.emergencyReason} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Unconscious, Critical Bleed" 
                    className="border-red-200 focus:ring-red-500 text-[#1A1A2E]"
                  />
                </div>
              )}

              {/* Patient Fields (Modified Labels if Emergency) */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
                   {emergency ? 'Patient Name (Unable to consent)' : 'Patient Name'}
                </Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.patientName}</p>
                <Input name="patientName" value={formData.patientName} onChange={handleInputChange} placeholder="Enter name" className="text-[#1A1A2E]" />
              </div>

              {/* Kin Details (Only if Emergency) */}
              {emergency && (
                 <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="h-px bg-slate-100 my-2" />
                    <h3 className="text-sm font-bold text-slate-900">Kin (Next of Kin) Details</h3>
                    
                    <div>
                      <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Kin Full Name</Label>
                      <Input name="kinName" value={formData.kinName} onChange={handleInputChange} placeholder="Enter kin name" className="text-[#1A1A2E]" />
                    </div>

                    <div>
                      <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Kin Phone</Label>
                      <Input name="kinPhone" value={formData.kinPhone} onChange={handleInputChange} placeholder="Ex: +91 9876543210" className="text-[#1A1A2E]" />
                    </div>

                    <div>
                      <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Relation to Patient</Label>
                      <Input name="kinRelation" value={formData.kinRelation} onChange={handleInputChange} placeholder="Ex: Son, Daughter, Spouse" className="text-[#1A1A2E]" />
                    </div>
                 </div>
              )}

              {/* Traditional Fields (Only if NOT emergency) */}
              {!emergency && (
                 <>
                   <div>
                    <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Patient ID</Label>
                    <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.patientId}</p>
                    <Input name="patientId" value={formData.patientId} onChange={handleInputChange} placeholder="Hospital ID" className="text-[#1A1A2E]" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Bed Number</Label>
                    <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.bedNumber}</p>
                    <Input name="bedNumber" value={formData.bedNumber} onChange={handleInputChange} placeholder="Bed #" className="text-[#1A1A2E]" />
                  </div>
                 </>
              )}

              {/* Surgery (Always needed) */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Target Surgery
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
                  className="w-full px-3 py-2 border rounded-lg text-sm text-[#1A1A2E]"
                  style={{
                    borderColor: "#D4D4E0",
                    backgroundColor: "white",
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

              {/* Language */}
              <div>
                <Label className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Consent Language</Label>
                <p className="text-xs text-slate-500 mb-2">{HINDI_LABELS.language}</p>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-[#1A1A2E]"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Inline Error Display */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={state === "loading"}
                className={`w-full font-bold py-6 transition-all rounded-2xl shadow-lg border-none ${emergency ? 'bg-red-600 hover:bg-red-700' : 'bg-[#5B4FCF] hover:bg-[#4B3FBF]'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {state === "loading" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  emergency ? 'Start Kin Consent Session' : 'Start AI Consultation'
                )}
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
                style={{ borderColor: "#E0E0E0", borderTopColor: emergency ? "#DC2626" : "#5B4FCF" }}
              />
              <div className="space-y-2">
                <p className="font-bold text-slate-800">
                  {emergency ? "Initializing Emergency Session..." : "Generating Patient Consent Video..."}
                </p>
                <p className="text-sm text-slate-500">
                  {emergency ? "Connecting to AI Doctor for Kin Consent" : `AI is translating risks into ${formData.language}`}
                </p>
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
              consentActor={emergency ? 'kin' : 'patient'}
              kinName={formData.kinName}
              kinRelation={formData.kinRelation}
              emergencyReason={formData.emergencyReason}
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
