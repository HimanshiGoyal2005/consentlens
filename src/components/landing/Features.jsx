"use client";

import { motion } from "framer-motion";
import { Video, ShieldCheck, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Video,
    title: "Dialect Video Consent",
    description:
      "AI avatar explains surgery risks in Bhojpuri, Maithili, or Hindi. Patient hears risks in mother tongue. 90-second video replaces 4-page English PDF that no one reads.",
  },
  {
    icon: ShieldCheck,
    title: "Comprehension Gate",
    description:
      "Patient cannot sign until they tap 'समझ गया' for all 5 risks. Random MCQ blocks blind clicking. Every tap logged with timestamp for audit.",
  },
  {
    icon: FileCheck2,
    title: "C2PA Legal Shield",
    description:
      "Video + PDF signed with C2PA standard. Tamper-proof and court-admissible. One-click verify shows patient, doctor, time, and SHA-256 hash.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white dark:bg-slate-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4 bg-purple-600/10 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400 border-purple-600/20">
            Why Hospitals Choose Us
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for Indian Hospitals
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Not a chatbot. A legal shield that saves 20 minutes per surgery.
          </p>
        </div>

        {/* ── Card Grid ── */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8"
              >
                {/* Icon */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 dark:bg-purple-600/20">
                  <Icon size={28} className="text-purple-600 dark:text-purple-500" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
