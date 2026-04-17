"use client";

import { motion } from "framer-motion";

export function ProgressBar({ 
  current, 
  total, 
  label, 
  trackClassName = "", 
  fillClassName = "" 
}) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full space-y-2">
      {(label || true) && (
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-text/40 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-black text-primary">{current}/{total}</span>
        </div>
      )}
      <div className={`h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner border border-black/5 ${trackClassName}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full bg-teal shadow-[0_0_10px_rgba(0,188,212,0.4)] ${fillClassName}`}
        />
      </div>
    </div>
  );
}
