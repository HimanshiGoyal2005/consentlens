"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, PlayCircle, Volume2, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV_LINKS = ["Features", "How It Works", "For Hospitals"];

function NavBar() {
  return (
    <nav className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-horizontal.svg" alt="ConsentLens" className="h-8" />
        </Link>

        {/* Links */}
        <div className="hidden lg:flex gap-6">
          {NAV_LINKS.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "")}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:flex border-purple-600/20 text-purple-600 dark:text-purple-400 hover:bg-purple-600/10"
          >
            Doctor Dashboard
          </Button>
        </Link>
        <Link
          href="/signin"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Sign Up
        </Button>
      </div>
    </nav>
  );
}

function AvatarStack() {
  return (
    <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
      <div className="flex -space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-950"
          />
        ))}
      </div>
      <span>Trusted by 20+ hospitals in India</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated speaking-indicator bars                                   */
/* ------------------------------------------------------------------ */
function SpeakingBars() {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-purple-400"
          animate={{ height: ["40%", "100%", "40%"] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patient PWA screen rendered as HTML/CSS inside the phone frame    */
/* ------------------------------------------------------------------ */
function PatientPWAScreen() {
  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white select-none">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-5 pt-8 pb-2 text-[10px] text-slate-400">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 rounded-sm border border-slate-500 relative">
            <div className="absolute inset-[1px] rounded-[1px] bg-green-400 w-[70%]" />
          </div>
        </div>
      </div>

      {/* ── App header ── */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <img src="/logo-horizontal.svg" alt="ConsentLens" className="h-4 brightness-0 invert" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2 py-0.5">
          <Globe className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] text-slate-300">हिन्दी</span>
        </div>
      </div>

      {/* ── Video / Avatar area ── */}
      <div className="mx-3 mt-2 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-purple-500/20 overflow-hidden">
        {/* Avatar circle + speaking indicator */}
        <div className="flex flex-col items-center py-5 gap-2">
          {/* Doctor avatar */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              👨‍⚕️
            </div>
            {/* Animated ring */}
            <motion.div
              className="absolute -inset-1 rounded-full border-2 border-purple-400/60"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3 text-purple-400" />
            <SpeakingBars />
            <span className="text-[10px] text-purple-300">
              Dr. Sharma bol rahe hain…
            </span>
          </div>
        </div>

        {/* Subtitle / transcript area */}
        <div className="bg-black/30 px-4 py-2.5 text-[11px] leading-relaxed text-slate-200 border-t border-white/5">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            &quot;Aapki ankhon mein motiyabind hai. Hum ek chhota operation
            karenge jisme purani lens nikalke nayi lens lagayenge…&quot;
          </motion.span>
        </div>
      </div>

      {/* ── Procedure info card ── */}
      <div className="mx-3 mt-3 rounded-lg bg-slate-800/60 border border-slate-700/50 px-3 py-2.5">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
          Procedure
        </p>
        <p className="text-xs font-medium">
          Cataract Surgery — Phacoemulsification
        </p>
        <div className="mt-2 flex gap-1.5">
          {["Risks", "Benefits", "Alternatives"].map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[9px] text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400">
            Comprehension Progress
          </span>
          <span className="text-[10px] text-purple-400 font-medium">68%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
            initial={{ width: "0%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Language pills ── */}
      <div className="mx-3 mt-3 flex gap-2">
        {[
          { label: "हिन्दी", active: true },
          { label: "Bhojpuri", active: false },
          { label: "English", active: false },
        ].map((lang) => (
          <span
            key={lang.label}
            className={`flex-1 text-center rounded-full py-1 text-[10px] font-medium transition-colors ${lang.active
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-800 text-slate-400"
              }`}
          >
            {lang.label}
          </span>
        ))}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Comprehension buttons ── */}
      <div className="mx-3 mb-4 flex flex-col gap-2">
        <motion.button
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>✓</span> Samajh Gaya
        </motion.button>
        <motion.button
          className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-xs font-medium text-slate-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>↺</span> Phir Se Batao
        </motion.button>
      </div>

      {/* ── C2PA trust badge ── */}
      <div className="flex items-center justify-center gap-1.5 pb-6 pt-1">
        <Shield className="h-3 w-3 text-emerald-500" />
        <span className="text-[9px] text-slate-500">C2PA Verified Consent</span>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mx-auto w-full max-w-[380px]"
      style={{ perspective: "1000px" }}
    >
      <div style={{ transform: "rotateY(-15deg) rotateX(5deg)" }}>
        {/* Phone frame */}
        <div className="relative rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 shadow-2xl shadow-purple-600/20">
          {/* Screen */}
          <div className="aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] bg-slate-950">
            <PatientPWAScreen />
          </div>

          {/* Notch */}
          <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-full bg-purple-600/20 blur-3xl" />
    </motion.div>
  );
}

export default function Hero() {
  return (
    <div className="relative bg-white dark:bg-slate-950 min-h-screen">
      {/* Background radial gradient */}
      <div className="absolute inset-0 -z-10 flex justify-center">
        <div className="w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_50%_0%,_rgba(124,58,237,0.15),_transparent_60%)]" />
      </div>

      {/* Sparkles */}
      <Sparkles className="absolute left-[10%] top-24 h-6 w-6 text-purple-500/40 animate-pulse" />
      <Sparkles className="absolute right-[15%] top-40 h-4 w-4 text-teal-500/40 animate-pulse [animation-delay:700ms]" />

      {/* Nav */}
      <NavBar />

      {/* Hero Grid */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 py-16 lg:px-8 lg:py-24">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start"
        >
          <Badge className="mb-6 bg-purple-600/10 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400 border-purple-600/20">
            AI-Powered Patient Care
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Surgery Consent in the Patient&apos;s Language.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            ConsentLens explains surgery risks in Bhojpuri, Hindi, or English
            via AI video. Patients tap &lsquo;Samajh Gaya&rsquo;. Doctors get
            C2PA proof. 2 hours become 10 minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/consent/new">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                Doctor Portal
              </Button>
            </Link>
            <Link href="/p/demo_session">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-slate-300 dark:border-slate-700 px-8"
              >
                <PlayCircle className="h-5 w-5" />
                Patient Demo
              </Button>
            </Link>
          </div>

          <AvatarStack />
        </motion.div>

        {/* Right Column */}
        <PhoneMockup />
      </section>
    </div>
  );
}
