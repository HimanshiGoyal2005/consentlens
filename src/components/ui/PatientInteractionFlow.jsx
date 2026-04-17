import { useState } from "react";
import { VoiceBot } from "./VoiceBot";
import { VoiceConfirmation } from "./VoiceConfirmation";
import { Card } from "./card";

/**
 * Handles the sequential flow: VoiceBot -> Voice Confirmation
 */
export function PatientInteractionFlow({ sessionId, videoUrl, language, patientName, surgeryName }) {
  const [step, setStep] = useState('agent'); // 'agent', 'voice', 'done'
  const [c2paHash, setC2paHash] = useState(null);

  const handleAgentConfirm = () => {
    setStep('voice');
  };

  const handleVoiceSuccess = (hash) => {
    setC2paHash(hash);
    setStep('done');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {step === 'agent' && (
        <div className="space-y-4 pt-12">
          <VoiceBot 
            sessionId={sessionId} 
            language={language} 
            patientName={patientName}
            surgeryName={surgeryName}
            onConfirmTransition={handleAgentConfirm}
          />
        </div>
      )}

      {step === 'voice' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Final Biometric Consent</h3>
          </div>
          <VoiceConfirmation 
            sessionId={sessionId} 
            language={language} 
            patientName={patientName}
            onSuccess={handleVoiceSuccess}
          />
        </div>
      )}

      {step === 'done' && (
        <Card className="p-8 text-center space-y-6 border-2 border-emerald-500/20 bg-emerald-50/30 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white text-3xl shadow-lg">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Legal Shield Active</h2>
            <p className="text-slate-600">
              Biometric consent for <strong>{patientName}</strong> verified and secured.
            </p>
          </div>

          {c2paHash && (
            <div className="p-4 bg-white rounded-xl border border-emerald-200 text-left space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Cryptographic Certification (C2PA)
              </div>
              <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600 break-all select-all">
                SHA-256: {c2paHash}
              </div>
              <button 
                className="w-full py-2 rounded-lg font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-colors"
                onClick={() => {
                  const element = document.createElement("a");
                  const content = `CONSENTLENS BIOMETRIC CERTIFICATE\n\nPatient: ${patientName}\nSession ID: ${sessionId}\nTimestamp: ${new Date().toISOString()}\n\nC2PA HASH (SHA-256):\n${c2paHash}\n\nThis document certifies that a biometric video consent was captured and its cryptographic hash matches the database record.`;
                  const file = new Blob([content], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `consent_certificate_${patientName.replace(/\\s+/g, '_')}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
              >
                Download Legal Certificate
              </button>
            </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="text-purple-600 font-bold hover:underline text-sm"
          >
            ← Start New Patient Session
          </button>
        </Card>
      )}
    </div>
  );
}
