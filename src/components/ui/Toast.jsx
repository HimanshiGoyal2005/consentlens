"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }} 
          animate={{ y: 20, opacity: 1 }} 
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-text text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold min-w-[280px] justify-center text-center ring-4 ring-text/10"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
