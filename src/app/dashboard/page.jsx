"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SURGERY_NAMES = {
  // GENERAL SURGERY
  cholecystectomy: "Gallbladder Removal / Cholecystectomy",
  hernia_repair: "Hernia Repair",
  hydrocele: "Hydrocele Surgery",
  piles: "Piles / Hemorrhoids Surgery",
  fistula: "Fistula Surgery",
  abscess_drainage: "Abscess Drainage",
  lipoma: "Lipoma Excision",
  circumcision: "Circumcision",
  thyroidectomy: "Thyroid Removal / Thyroidectomy",
  appendix_lap: "Laparoscopic Appendectomy",

  // OBSTETRICS & GYNAE
  normal_delivery: "Normal Delivery",
  lscs: "C-Section / LSCS",
  dnc: "D&C / Dilatation & Curettage",
  tubectomy: "Tubectomy / Nasbandi",
  hysterectomy: "Bacchedani ka Operation / Hysterectomy",
  mtp: "MTP / Medical Abortion",
  ectopic: "Ectopic Pregnancy Surgery",

  // ORTHOPEDIC
  knee_replace: "Total Knee Replacement",
  fracture_fix: "Fracture Fixation / Rod-Plating",
  thr: "Total Hip Replacement",
  arthroscopy: "Arthroscopy / Knee Camera",
  spine_surgery: "Spine Surgery",
  acl_repair: "ACL Repair / Ligament Surgery",
  shoulder_replace: "Shoulder Replacement",

  // CARDIAC
  angiography: "Angiography",
  angioplasty: "Angioplasty + Stent",
  cabg: "Bypass Surgery / CABG",
  pacemaker: "Pacemaker Implant",
  valve_replace: "Valve Replacement",
  asd_closure: "ASD Closure",

  // NEURO
  craniotomy: "Craniotomy / Brain Surgery",
  spine_tumor: "Spine Tumor Removal",
  vp_shunt: "VP Shunt",
  epilepsy_surgery: "Epilepsy Surgery",
  brain_biopsy: "Brain Biopsy",

  // ENT
  tonsillectomy: "Tonsil Removal / Tonsillectomy",
  adenoidectomy: "Adenoid Removal",
  septoplasty: "Septoplasty / Naak ki Haddi",
  fess: "FESS / Sinus Surgery",
  myringotomy: "Ear Drum Surgery / Myringotomy",
  mastoidectomy: "Mastoidectomy",

  // OPHTHAL
  cataract: "Cataract Surgery",
  glaucoma: "Glaucoma Surgery / Kaala Motia",
  retinal_detachment: "Retinal Detachment Surgery",
  lasik: "LASIK / Chashma Hatana",
  squint: "Squint Correction / Bhengaapan",
  pterygium: "Pterygium Removal",

  // UROLOGY
  pcnl: "Kidney Stone / PCNL",
  turp: "TURP / Prostate Surgery",
  cystoscopy: "Cystoscopy / Bladder Camera",
  varicocele: "Varicocele Surgery",
  vasectomy: "Vasectomy / Nasbandi Male",
  nephrectomy: "Kidney Removal / Nephrectomy",

  // ONCOLOGY
  mastectomy: "Mastectomy / Breast Removal",
  lumpectomy: "Lumpectomy / Breast Lump",
  colon_resection: "Colon Cancer Surgery",
  oral_cancer: "Oral Cancer Surgery",

  // PEDIATRIC
  cleft_lip: "Cleft Lip / Kata Honth",
  congenital_hernia: "Congenital Hernia",
  undescended_testis: "Undescended Testis",
  pda_ligation: "PDA Ligation",

  // DENTAL
  rct: "Root Canal Treatment / RCT",
  extraction: "Tooth Extraction / Daant Nikalna",
  implant: "Dental Implant",
  jaw_fracture: "Jaw Fracture Fixation",
  wisdom_tooth: "Wisdom Tooth Removal",

  // PLASTIC
  burn_contracture: "Burn Contracture Release",
  skin_graft: "Skin Graft",
  scar_revision: "Scar Revision",
  rhinoplasty: "Rhinoplasty / Naak Surgery",

  // EMERGENCY
  trauma_lap: "Trauma Laparotomy",
  emergency_craniotomy: "Emergency Craniotomy",
  emergency_lscs: "Emergency C-Section",
  vascular_repair: "Vascular Repair",
  splenectomy: "Spleen Removal / Splenectomy",
};

const STATUS_BADGES = {
  generating: { bg: "#E0E0E0", text: "#7A7A8E" },
  ready: { bg: "#B3E5FC", text: "#0288D1" },
  in_progress: { bg: "#FFF9C4", text: "#F57F17" },
  completed: { bg: "#B2DFDB", text: "#00796B" },
  approved: { bg: "#C8E6C9", text: "#2E7D32" },
};

function TimeAgo({ timestamp }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!timestamp) return;

      const now = new Date();
      const diff = Math.floor((now - new Date(timestamp)) / 1000);

      if (diff < 60) {
        setTimeAgo("now");
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      } else if (diff < 86400) {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 86400)}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
}

function SessionCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse"></div>
      </div>
    </Card>
  );
}

function SessionCard({ session, onApprove, isApproving }) {
  const surgeryName = SURGERY_NAMES[session.surgery_id] || session.surgery_id;
  const statusBadge = STATUS_BADGES[session.status] || STATUS_BADGES.generating;
  const comprehensionScore = session.comprehension_score || 0;

  return (
    <Card
      className="p-5 space-y-4"
      style={{ borderRadius: "16px", border: "1px solid #E0E0E0" }}
    >
      {/* Header: Patient Name + Bed Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: "#1A1A2E" }}>
          {session.patient_name}
        </h3>
        <span
          className="px-3 py-1 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "#B3E5FC",
            color: "#0288D1",
          }}
        >
          Bed {session.bed_number}
        </span>
      </div>

      {/* Surgery + Language */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p style={{ color: "#7A7A8E" }}>Surgery</p>
          <p style={{ color: "#1A1A2E" }} className="font-medium">
            {surgeryName}
          </p>
        </div>
        <div>
          <p style={{ color: "#7A7A8E" }}>Language</p>
          <p style={{ color: "#1A1A2E" }} className="font-medium">
            {session.language}
          </p>
        </div>
      </div>

      {/* Comprehension Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm" style={{ color: "#7A7A8E" }}>
            Comprehension Score
          </p>
          <p className="text-sm font-medium" style={{ color: "#00BCD4" }}>
            {comprehensionScore} / 5
          </p>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "#E0E0E0" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              backgroundColor: "#00BCD4",
              width: `${(comprehensionScore / 5) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Status + Time + Actor Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span
             className="px-3 py-1 rounded-lg text-xs font-medium"
             style={{
               backgroundColor: statusBadge.bg,
               color: statusBadge.text,
             }}
           >
             {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
           </span>
           {session.consent_actor === 'kin' && (
             <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
               Kin Consent
             </span>
           )}
        </div>
        <p className="text-xs" style={{ color: "#7A7A8E" }}>
          <TimeAgo timestamp={session.created_at} />
        </p>
      </div>

      {/* Emergency / Kin Details */}
      {session.consent_actor === 'kin' && (
        <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 space-y-2 text-xs">
          <div className="flex justify-between">
             <span className="text-red-500 font-bold uppercase tracking-tight">Kin Member</span>
             <span className="text-slate-900 font-medium">{session.kin_name} ({session.kin_relation})</span>
          </div>
          <div className="flex justify-between border-t border-red-100 pt-1.5 mt-1.5">
             <span className="text-red-500 font-bold uppercase tracking-tight">Reason</span>
             <span className="text-slate-900 line-clamp-1">{session.emergency_reason}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          asChild
          variant="outline"
          className="text-sm font-medium"
          style={{
            borderColor: "#D4D4E0",
            color: "#5B4FCF",
            borderRadius: "12px",
          }}
        >
          <Link href={`/verify/${session.session_id}`}>View Verify</Link>
        </Button>

        {session.status === "completed" && (
          <Button
            onClick={() => onApprove(session.session_id)}
            disabled={isApproving}
            className="text-sm font-medium"
            style={{
              backgroundColor: "#5B4FCF",
              color: "white",
              borderRadius: "12px",
            }}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        )}
        
        {session.status === "approved" && (
           <div className="col-span-2 text-[10px] text-center text-slate-400 mt-1">
             {session.consent_actor === 'kin' ? `Consented by Kin: ${session.kin_name} • Approved at ${new Date(session.approved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : `Consented by Patient • Approved at ${new Date(session.approved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
           </div>
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [approvingId, setApprovingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    avgComprehension: 0,
  });

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("consent_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  // Calculate stats
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionsToday = sessions.filter((s) => {
      const sessionDate = new Date(s.created_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const approvedToday = sessionsToday.filter(
      (s) => s.status === "approved",
    ).length;

    const avgComprehension =
      sessionsToday.length > 0
        ? Math.round(
          sessionsToday.reduce(
            (sum, s) => sum + (s.comprehension_score || 0),
            0,
          ) / sessionsToday.length,
        )
        : 0;

    setStats({
      total: sessionsToday.length,
      approved: approvedToday,
      avgComprehension,
    });
  }, [sessions]);

  // Filter sessions
  useEffect(() => {
    let filtered = sessions;

    if (filter === "Pending") {
      filtered = sessions.filter((s) =>
        ["generating", "ready", "in_progress"].includes(s.status),
      );
    } else if (filter === "Completed") {
      filtered = sessions.filter((s) => s.status === "completed");
    } else if (filter === "Approved") {
      filtered = sessions.filter((s) => s.status === "approved");
    }

    setFilteredSessions(filtered);
  }, [filter, sessions]);

  // Initial fetch
  useEffect(() => {
    fetchSessions().finally(() => setLoading(false));
  }, [fetchSessions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleApprove = async (sessionId) => {
    setApprovingId(sessionId);

    try {
      const response = await fetch("/api/consent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) throw new Error("Failed to approve");

      // Optimistic update
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, status: "approved" } : s,
        ),
      );
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F4FF", minHeight: "100vh", color: "#1A1A2E" }}>
      {/* Navbar */}
      <nav
        className="border-b px-6 py-4"
        style={{
          backgroundColor: "white",
          borderColor: "#E0E0E0",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <img src="/logo-horizontal.svg" alt="ConsentLens" className="h-8" />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <span
                className="font-medium cursor-pointer"
                style={{ color: "#5B4FCF" }}
              >
                Dashboard
              </span>
            </Link>
            <Link href="/consent/new">
              <Button
                className="font-medium"
                style={{
                  backgroundColor: "#5B4FCF",
                  color: "white",
                  borderRadius: "12px",
                }}
              >
                New Consent
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="font-medium"
              style={{ color: "#1A1A2E" }}
              onClick={() => {
                localStorage.removeItem("doctorId");
                window.location.href = "/";
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center" style={{ borderRadius: "16px" }}>
            <p className="text-3xl font-bold" style={{ color: "#5B4FCF" }}>
              {stats.total}
            </p>
            <p style={{ color: "#7A7A8E", fontSize: "0.875rem" }}>
              Sessions Today
            </p>
          </Card>

          <Card className="p-4 text-center" style={{ borderRadius: "16px" }}>
            <p className="text-3xl font-bold" style={{ color: "#00BCD4" }}>
              {stats.approved}
            </p>
            <p style={{ color: "#7A7A8E", fontSize: "0.875rem" }}>
              Approved Today
            </p>
          </Card>

          <Card className="p-4 text-center" style={{ borderRadius: "16px" }}>
            <p className="text-3xl font-bold" style={{ color: "#E91E8C" }}>
              {stats.avgComprehension}/5
            </p>
            <p style={{ color: "#7A7A8E", fontSize: "0.875rem" }}>
              Avg Comprehension
            </p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex gap-2 mb-6 pb-4 border-b"
          style={{ borderColor: "#E0E0E0" }}
        >
          {["All", "Pending", "Completed", "Approved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-4 py-2 font-medium text-sm rounded-lg transition-all"
              style={{
                backgroundColor: filter === tab ? "#5B4FCF" : "transparent",
                color: filter === tab ? "white" : "#7A7A8E",
                borderBottom: filter === tab ? "none" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}

          {/* Refresh Button */}
          <div className="ml-auto">
            <Button
              onClick={() => {
                setLoading(true);
                fetchSessions().finally(() => setLoading(false));
              }}
              variant="outline"
              className="text-sm"
              style={{
                borderColor: "#D4D4E0",
                color: "#5B4FCF",
                borderRadius: "12px",
              }}
            >
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Sessions Grid or Empty State */}
        {loading && sessions.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="p-12 text-center" style={{ borderRadius: "16px" }}>
            <p
              className="text-lg font-medium mb-4"
              style={{ color: "#1A1A2E" }}
            >
              No consent sessions yet
            </p>
            <p className="text-sm mb-6" style={{ color: "#7A7A8E" }}>
              Start one from New Consent.
            </p>
            <Link href="/consent/new">
              <Button
                className="font-medium"
                style={{
                  backgroundColor: "#5B4FCF",
                  color: "white",
                  borderRadius: "12px",
                }}
              >
                Create New Consent
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.session_id}
                session={session}
                onApprove={handleApprove}
                isApproving={approvingId === session.session_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
