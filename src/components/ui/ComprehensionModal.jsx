"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PillButton } from "./PillButton";

export function ComprehensionModal({ isVisible, onSuccess }) {
  const [step, setStep] = useState('voice'); // 'voice', 'mcq'

  const handleVoiceSuccess = () => {
    onSuccess('voice', { score: 100 });
  };

  const handleMcqSuccess = () => {
    onSuccess('mcq', { score: 100 });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
        >
          <div className="w-full max-w-sm text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-xl shadow-primary/5">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-primary mb-2">Comprehension Check</h2>
            <p className="text-text/60 text-sm mb-10 px-4">Based on the education card you watched, please confirm your understanding.</p>

            {step === 'voice' ? (
              <div className="space-y-6">
                <button 
                  onClick={handleVoiceSuccess}
                  className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
                  </div>
                </button>
                <div className="text-primary font-bold animate-pulse text-sm tracking-widest uppercase">Tap to speak response</div>
                <button onClick={() => setStep('mcq')} className="text-xs text-text/40 underline uppercase tracking-widest font-bold">Use Quiz instead</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 w-full">
                {["Yes, I understand clearly", "No, I have some doubts", "Repeat the risks", "Contact a doctor"].map((opt) => (
                  <PillButton key={opt} variant="outline" className="w-full text-left justify-start" onClick={handleMcqSuccess}>
                    {opt}
                  </PillButton>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
