"use client";

import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Speaks Their Language",
    description:
      "Avatar explains surgery risks in Bhojpuri, Maithili, Awadhi and 50+ Indian dialects — not translated English. Patients understand. Not just sign.",
    color: "#00BCD4", // Teal
  },
  {
    icon: ShieldCheck,
    title: "Proves Understanding",
    description:
      "Patient taps Samajh Gaya after each risk. Random MCQ voice check after all 5. Can't proceed to signature without genuinely understanding.",
    color: "#5B4FCF", // Purple
  },
  {
    icon: Lock,
    title: "Court-Proof Receipt",
    description:
      "C2PA tamper-proof video receipt with QR overlay every 5 seconds. Scan any frame. Match to session log. Used in journalism — now in medicine.",
    color: "#E91E8C", // Pink
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#F5F4FF] dark:bg-slate-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4 bg-purple-600/10 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400 border-purple-600/20">
            Why ConsentLens Works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] dark:text-white sm:text-4xl">
            Three pillars that protect patients, doctors, and hospitals.
          </h2>
        </div>

        {/* ── Card Grid ── */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative rounded-[16px] bg-white dark:bg-slate-900 p-8 shadow-sm border-t-[3px]"
                style={{ borderTopColor: feature.color }}
              >
                {/* Icon Wrapper */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${feature.color}15` }}>
                  <Icon size={28} style={{ color: feature.color }} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#1A1A2E] dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
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
