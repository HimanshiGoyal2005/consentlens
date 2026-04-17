"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ForHospitals() {
  const [surgeries, setSurgeries] = useState(200);
  const [minutes, setMinutes] = useState(20);

  // Computed ROI Values
  const hoursSaved = (surgeries * minutes * 0.75) / 60;
  const extraSurgeries = Math.floor(hoursSaved / 1.5);
  const revenueUnlocked = extraSurgeries * 45000;

  return (
    <section id="forhospitals" className="bg-[#F5F4FF] dark:bg-slate-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] dark:text-white sm:text-4xl">
            The CFO Math
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            One lawsuit avoided pays for 3 years of ConsentLens.
          </p>
        </div>

        {/* ── ROI Calculator Widget ── */}
        <div className="mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1A1A2E] rounded-[24px] p-8 lg:p-12 shadow-2xl overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#00BCD4]/10 rounded-full blur-3xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              {/* Inputs */}
              <div className="space-y-8">
                <div>
                  <label htmlFor="surgeries" className="block text-sm font-medium text-slate-400 mb-3">
                    Surgeries per month
                  </label>
                  <input
                    id="surgeries"
                    type="number"
                    value={surgeries}
                    onChange={(e) => setSurgeries(Number(e.target.value))}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-white text-xl focus:ring-2 focus:ring-[#00BCD4] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="minutes" className="block text-sm font-medium text-slate-400 mb-3">
                    Consent conversations per surgery (minutes)
                  </label>
                  <input
                    id="minutes"
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-white text-xl focus:ring-2 focus:ring-[#00BCD4] transition-all"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="bg-slate-800/50 rounded-2xl p-8 space-y-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Surgeon hours saved / month</div>
                  <div className="text-2xl font-bold text-[#00BCD4]">{hoursSaved.toFixed(1)} hours</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Extra surgeries possible / month</div>
                  <div className="text-2xl font-bold text-[#00BCD4]">{extraSurgeries} surgeries</div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Revenue unlocked / month</div>
                  <div className="text-3xl font-extrabold text-[#00BCD4]">
                    Rs {revenueUnlocked.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Lawsuit risk reduction</div>
                  <div className="text-sm font-medium text-emerald-400">
                    Rs 50L per avoided consent dispute
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Stats Row ── */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Hospitals in India', value: '70,000' },
              { label: 'Total Addressable Market', value: 'Rs 840 Cr' },
              { label: "Don't Read English Forms", value: '68%' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-[#1A1A2E] dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
