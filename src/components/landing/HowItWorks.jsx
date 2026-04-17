"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Cpu, 
  Smartphone, 
  Hand, 
  ListChecks, 
  ShieldCheck, 
  MessageSquare 
} from "lucide-react";

/**
 * Steps sequence for the ConsentLens process
 */
const steps = [
  {
    icon: Stethoscope,
    title: "Doctor Selects Surgery",
    desc: "Appendix, Gallbladder, C-Section. Language: Bhojpuri.",
  },
  {
    icon: Cpu,
    title: "AI Generates Video",
    desc: "GPT-4o simplifies risks. ElevenLabs speaks. D-ID avatar lipsyncs. 45 seconds.",
  },
  {
    icon: Smartphone,
    title: "Patient Watches",
    desc: "WhatsApp-style UI on ward tablet. Big buttons for elderly.",
  },
  {
    icon: Hand,
    title: "Comprehension Gate",
    desc: "Taps 'समझ गया' after each risk. Cannot skip or fake.",
  },
  {
    icon: ListChecks,
    title: "MCQ Check",
    desc: "Random question: 'Dard kitne din?'. Wrong = nurse called automatically.",
  },
  {
    icon: ShieldCheck,
    title: "C2PA Signing",
    desc: "Video + face nod hashed. Tamper-proof certificate created instantly.",
  },
  {
    icon: MessageSquare,
    title: "Doctor Approves",
    desc: "WhatsApp: '5/5 understood'. 1-tap approve files to EHR via FHIR.",
  },
];

export default function HowItWorks() {
  return (
    <section id="howitworks" className="bg-slate-50 dark:bg-slate-900/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header content */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4 bg-teal-600/10 text-teal-700 dark:bg-teal-600/20 dark:text-teal-400 border-teal-600/20">
            How It Works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From RBI PDF to Doctor Approval in 3 Minutes
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Seven steps. Zero paper. Full legal proof.
          </p>
        </div>

        {/* Grid layout */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          
          {/* LEFT: PHONE MOCKUP */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }} 
            className="relative mx-auto w-full max-w-[340px] lg:mx-0"
          >
            {/* Phone frame */}
            <div className="relative rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 shadow-2xl">
              {/* Screen fallback/placeholder as requested */}
              <div className="aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 mb-4 flex items-center justify-center border border-slate-800">
                   <ShieldCheck className="w-8 h-8 text-teal-500" />
                </div>
                <div className="text-sm font-medium text-slate-400 mb-2">PWA Preview</div>
                <div className="text-[10px] text-slate-600">Patient consent interface is being generated...</div>
              </div>
              
              {/* Notch */}
              <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-8 -z-10 rounded-full bg-teal-600/10 blur-3xl" />
          </motion.div>

          {/* RIGHT: NUMBERED LIST */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }} 
            viewport={{ once: true }} 
            className="flex flex-col gap-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.1 }} 
                  viewport={{ once: true }} 
                  className="flex gap-4"
                >
                  {/* Step Number Circle */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white font-semibold text-lg">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {/* Sub-icon container */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                        <Icon size={18} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
