"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SURGERY_NAMES = {
  appendix_lap: "Laparoscopic Appendectomy",
  knee_replace: "Total Knee Replacement",
  cataract: "Cataract Surgery",
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

      {/* Status + Time */}
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: statusBadge.bg,
            color: statusBadge.text,
          }}
        >
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
        <p className="text-xs" style={{ color: "#7A7A8E" }}>
          <TimeAgo timestamp={session.created_at} />
        </p>
      </div>

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
    <div style={{ backgroundColor: "#F5F4FF", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        className="border-b px-6 py-4"
        style={{
          backgroundColor: "white",
          borderColor: "#E0E0E0",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "#5B4FCF" }}>
            ConsentLens
          </h1>

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
