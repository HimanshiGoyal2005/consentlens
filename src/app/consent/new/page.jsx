"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

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
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

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

      const session = await response.json();
      setPollCount((prev) => prev + 1);

      if (session.status === "ready") {
        setVideoUrl(session.video_url);
        const patientLink = `${window.location.origin}/p/${sid}`;
        setQrCodeUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            patientLink,
          )}`,
        );
        setState("success");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Polling error:", err);
      setError("Failed to check video status");
      setState("error");
      return false;
    }
  }, []);

  useEffect(() => {
    if (state !== "loading" || !sessionId) return;

    const pollInterval = setInterval(async () => {
      const isReady = await pollSession(sessionId);
      if (isReady) {
        clearInterval(pollInterval);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [state, sessionId, pollSession]);

  const handleSubmit = async (e) => {
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

    setState("loading");
    setError(null);
    setPollCount(0);

    try {
      const response = await fetch("/api/consent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate consent");
      }

      const data = await response.json();
      setSessionId(data.session_id);
      // Polling will start automatically via useEffect
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to generate consent video");
      setState("error");
    }
  };

  const handleRetry = () => {
    setState("form");
    setSessionId(null);
    setError(null);
    setPollCount(0);
  };

  const copyToClipboard = () => {
    const patientLink = `${window.location.origin}/p/${sessionId}`;
    navigator.clipboard.writeText(patientLink);
    alert("Patient link copied to clipboard!");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5F4FF" }}
    >
      <Card className="w-full max-w-md">
        {/* Header */}
        <div
          className="px-6 py-4 border-b text-center"
          style={{ backgroundColor: "#5B4FCF", borderColor: "#E0E0E0" }}
        >
          <h1 className="text-xl font-bold" style={{ color: "white" }}>
            ConsentLens
          </h1>
          <p style={{ color: "#E8E8F0", fontSize: "0.875rem" }}>
            Doctor Portal
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

              {/* Patient Name */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Patient Name
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.patientName}
                </p>
                <Input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder="Enter patient name"
                  style={{ color: "#1A1A2E" }}
                />
              </div>

              {/* Patient ID */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Patient ID
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.patientId}
                </p>
                <Input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  placeholder="Hospital ID"
                  style={{ color: "#1A1A2E" }}
                />
              </div>

              {/* Bed Number */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Bed Number
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.bedNumber}
                </p>
                <Input
                  type="text"
                  name="bedNumber"
                  value={formData.bedNumber}
                  onChange={handleInputChange}
                  placeholder="Enter bed number"
                  style={{ color: "#1A1A2E" }}
                />
              </div>

              {/* Language */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Language
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.language}
                </p>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: "#D4D4E0",
                    backgroundColor: "white",
                    color: "#1A1A2E",
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kin Phone */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Kin Phone (WhatsApp)
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.kinPhone}
                </p>
                <Input
                  type="tel"
                  name="kinPhone"
                  value={formData.kinPhone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  style={{ color: "#1A1A2E" }}
                />
              </div>

              {/* Doctor ID */}
              <div>
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#1A1A2E" }}
                >
                  Doctor ID
                </Label>
                <p
                  className="text-xs"
                  style={{ color: "#7A7A8E", marginBottom: "0.5rem" }}
                >
                  {HINDI_LABELS.doctorId}
                </p>
                <Input
                  type="text"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  placeholder="Your doctor ID"
                  style={{ color: "#1A1A2E" }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full font-bold py-2"
                style={{
                  backgroundColor: "#5B4FCF",
                  color: "white",
                  borderRadius: "16px",
                }}
              >
                Generate Consent Video
              </Button>

              {/* Back to Dashboard */}
              <div className="text-center">
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    style={{ color: "#5B4FCF" }}
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </form>
          )}

          {state === "loading" && (
            <div className="text-center space-y-4">
              <div className="py-8">
                <div
                  className="inline-block w-12 h-12 border-4 border-t-4 rounded-full animate-spin"
                  style={{
                    borderColor: "#E0E0E0",
                    borderTopColor: "#5B4FCF",
                  }}
                ></div>
              </div>
              <p className="font-medium" style={{ color: "#1A1A2E" }}>
                Generating consent video...
              </p>
              <p className="text-sm" style={{ color: "#7A7A8E" }}>
                (~45 seconds)
              </p>

              {/* Progress Bar */}
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "#E0E0E0" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: "#5B4FCF",
                    width: `${Math.min(pollCount * 10, 90)}%`,
                  }}
                ></div>
              </div>

              <p className="text-xs" style={{ color: "#7A7A8E" }}>
                Status:{" "}
                {pollCount > 0 ? `Checking (${pollCount}s)` : "Starting..."}
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="text-center space-y-4">
              <div className="py-4">
                <div
                  className="flex w-16 h-16 rounded-full items-center justify-center mx-auto"
                  style={{ backgroundColor: "#00BCD4" }}
                >
                  <svg className="w-8 h-8" fill="white" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>
                Video Ready
              </h2>
              <p className="text-sm" style={{ color: "#7A7A8E" }}>
                The consent video has been generated successfully.
              </p>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center py-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "#F0F0F8" }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Patient Link QR Code"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              )}

              {/* Copy Link Button */}
              <Button
                onClick={copyToClipboard}
                className="w-full font-medium py-2"
                style={{
                  backgroundColor: "#5B4FCF",
                  color: "white",
                  borderRadius: "16px",
                }}
              >
                Copy Patient Link
              </Button>

              {/* View Page Button */}
              <Button
                asChild
                variant="outline"
                className="w-full font-medium py-2"
                style={{
                  borderColor: "#D4D4E0",
                  color: "#5B4FCF",
                  borderRadius: "16px",
                }}
              >
                <Link href={`/verify/${sessionId}`}>View Verify Page</Link>
              </Button>

              {/* Back to Dashboard */}
              <Button
                asChild
                variant="ghost"
                className="w-full text-sm"
                style={{ color: "#5B4FCF" }}
              >
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="text-center space-y-4">
              <div className="py-4">
                <div
                  className="flex w-16 h-16 rounded-full items-center justify-center mx-auto"
                  style={{ backgroundColor: "#FFE8F0" }}
                >
                  <svg className="w-8 h-8" fill="#E91E8C" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>
                Error
              </h2>
              <p className="text-sm" style={{ color: "#E91E8C" }}>
                {error}
              </p>

              {/* Retry Button */}
              <Button
                onClick={handleRetry}
                className="w-full font-medium py-2"
                style={{
                  backgroundColor: "#5B4FCF",
                  color: "white",
                  borderRadius: "16px",
                }}
              >
                Try Again
              </Button>

              {/* Back to Dashboard */}
              <Button
                asChild
                variant="ghost"
                className="w-full text-sm"
                style={{ color: "#5B4FCF" }}
              >
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
