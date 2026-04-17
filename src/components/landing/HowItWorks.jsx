"use client";

import { motion } from "framer-motion";
import { 
  UserPlus, 
  Cpu, 
  Smartphone, 
  SearchCheck, 
  ShieldCheck, 
  Bell, 
  ClipboardCheck 
} from "lucide-react";

/**
 * Seven-step flow for ConsentLens process
 */
const STEPS = [
  {
    title: "1. Doctor Selects",
    body: "Surgery type, patient name, language, kin phone. Takes 10 seconds.",
    icon: UserPlus,
  },
  {
    title: "2. AI Generates",
    body: "Gemini simplifies risks. ElevenLabs creates Bhojpuri audio. D-ID avatar lipsyncs. 90-second video ready in 45 seconds.",
    icon: Cpu,
  },
  {
    title: "3. Patient Watches",
    body: "Full-screen avatar video on tablet. Samajh Gaya / Phir Se Batao after each risk.",
    icon: Smartphone,
  },
  {
    title: "4. Comprehension Verified",
    body: "5/5 taps logged with timestamps. MCQ voice check. Face cam nod captured.",
    icon: SearchCheck,
  },
  {
    title: "5. Proof Sealed",
    body: "C2PA hash generated. QR watermark embedded. FHIR DocumentReference created.",
    icon: ShieldCheck,
  },
  {
    title: "6. Doctor Notified",
    body: "WhatsApp: 'Bed 12 understood 5/5. Ready for your 2-min consultation.' One tap to Approve.",
    icon: Bell,
  },
  {
    title: "7. OT Ready",
    body: "OT schedule updated. Nursing station notified. Language pref logged in EHR.",
    icon: ClipboardCheck,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function HowItWorks() {
  return (
    <section id="howitworks" className="bg-white dark:bg-slate-900 py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#5B4FCF]">
            The Journey
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E] dark:text-white sm:text-4xl">
            From Paper Chase to 3 Minutes
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            7 steps. Fully automated. Human oversight preserved at every stage.
          </p>
        </div>

        {/* Steps List */}
        <motion.div 
          className="mx-auto max-w-3xl flex flex-col gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index} 
                className="flex items-start gap-6 group"
                variants={itemVariants}
              >
                {/* Number Circle */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5B4FCF] text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-[#1A1A2E] dark:text-white">
                      {step.title}
                    </h3>
                    {/* Small Icon */}
                    <Icon size={20} className="text-[#5B4FCF]/40 group-hover:text-[#5B4FCF] transition-colors" />
                  </div>
                  <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
