"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PillButton } from "./PillButton";

export function NurseModal({ isVisible, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-text/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[var(--radius-card)] p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-pink" />
            
            <div className="w-20 h-20 bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pink">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-text mb-4">Escalation Threshold</h2>
            <p className="text-text/60 text-sm mb-8">
              Multiple replays requested. A healthcare professional is on their way to explain this card in person.
            </p>
            
            <PillButton variant="pink" className="w-full" onClick={onClose}>
              Await Nurse
            </PillButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
