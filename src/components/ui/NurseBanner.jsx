"use client";

import { motion, AnimatePresence } from "framer-motion";

export function NurseBanner({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -60, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-pink text-white p-3 text-center flex items-center justify-center gap-2 shadow-lg px-6"
        >
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-[10px] font-black">!</span>
          </div>
          <p className="text-xs font-bold tracking-wide uppercase">Nurse notified for clarification</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
