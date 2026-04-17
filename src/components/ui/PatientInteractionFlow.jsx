import { useState } from "react";
import { VoiceBot } from "./VoiceBot";
import { VoiceConfirmation } from "./VoiceConfirmation";
import { Card } from "./card";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Handles the sequential flow: VoiceBot -> Voice Confirmation
 */
export function PatientInteractionFlow({ 
  sessionId, 
  videoUrl, 
  language, 
  patientName, 
  surgeryName,
  consentActor = 'patient',
  kinName,
  kinRelation,
  emergencyReason
}) {
  // FAST-TRACK: Skip AI agent for emergency kin consent
  const [step, setStep] = useState(consentActor === 'kin' ? 'voice' : 'agent'); // 'agent', 'voice', 'done'
  const [c2paHash, setC2paHash] = useState(null);

  const handleAgentConfirm = () => {
    setStep('voice');
  };

  const handleVoiceSuccess = (hash) => {
    setC2paHash(hash);
    setStep('done');
    // AUTO-DOWNLOAD: In emergencies, give the PDF immediately
    if (consentActor === 'kin') {
      setTimeout(() => downloadPDF(), 500);
    }
  };

  const downloadPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
      const { width, height } = page.getSize();
      let cursorY = height - 80;

      const drawText = (text, size, fontType = font, indent = 50) => {
        page.drawText(text, { x: indent, y: cursorY, size, font: fontType, color: rgb(0.1, 0.1, 0.1) });
        cursorY -= (size + 12);
      };

      // Header
      page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: consentActor === 'kin' ? rgb(1, 0.95, 0.95) : rgb(0.96, 0.96, 0.98) });
      cursorY = height - 60;
      drawText(consentActor === 'kin' ? 'EMERGENCY KIN CONSENT CERTIFICATE' : 'CONSENTLENS MEDICAL CERTIFICATE', 18, boldFont);
      drawText('Secure Biometric Auditing System', 10, font);
      cursorY -= 30;

      // Patient Details
      drawText('PATIENT & SURGERY DETAILS', 14, boldFont);
      if (consentActor === 'kin') {
        drawText(`Consenting Kin: ${kinName} (${kinRelation})`, 12, boldFont);
        drawText(`On behalf of Patient: ${patientName}`, 12);
        drawText(`Emergency Justification: ${emergencyReason}`, 11, font, 50);
        cursorY -= 5;
      } else {
        drawText(`Patient Name: ${patientName}`, 12);
      }
      
      drawText(`Procedure: ${surgeryName}`, 12);
      drawText(`Education Language: ${language}`, 12);
      drawText(`Date & Time: ${new Date().toLocaleString()}`, 12);
      cursorY -= 20;

      // Cryptographic Section
      drawText('BIOMETRIC VERIFICATION (C2PA)', 14, boldFont);
      drawText(`This document certifies that the ${consentActor === 'kin' ? 'kin legal representative' : 'patient'} visually and vocally consented`, 11);
      drawText('to the surgical procedure outlined above. A biometric video record', 11);
      drawText('has been captured, audited, and secured using cryptographic hashing.', 11);
      cursorY -= 15;
      
      drawText('SHA-256 Cryptographic Fingerprint:', 10, boldFont);
      drawText(c2paHash || 'Pending...', 9);
      cursorY -= 40;

      // Signatures
      drawText('__________________________________________', 12);
      drawText('Attending Physician / Surgeon Signature', 10);
      
      cursorY -= 60;
      drawText('__________________________________________', 12);
      drawText(consentActor === 'kin' ? `Kin Representative Signature [${kinName}]` : 'Patient Signature', 10);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ConsentLens_${consentActor === 'kin' ? 'Kin_' : ''}Certificate_${patientName.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
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
            kinName={kinName}
            kinRelation={kinRelation}
          />
        </div>
      )}

      {step === 'voice' && (
        <div className="space-y-6 max-w-2xl mx-auto pt-6">
          {consentActor === 'kin' && (
            <Card className="p-6 border-red-500/30 bg-red-50/50 shadow-xl rounded-3xl animate-in slide-in-from-top-4 duration-700">
               <div className="flex items-center gap-3 text-red-600 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Emergency Consent Form</h2>
               </div>
               
               <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Subject Patient</p>
                    <p className="font-bold text-slate-900">{patientName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Surgery</p>
                    <p className="font-bold text-slate-900">{surgeryName}</p>
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Consenting Kin</p>
                    <p className="font-bold text-slate-900">{kinName} ({kinRelation})</p>
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Justification</p>
                    <p className="font-bold text-slate-900 line-clamp-2">{emergencyReason}</p>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-red-100 text-[10px] text-slate-400 font-medium italic">
                 "I, the relative of the patient, understand the urgency and hereby provide legal biometric consent for the procedure described above."
               </div>
            </Card>
          )}

          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Final Biometric Signature</h3>
          </div>
          <VoiceConfirmation 
            sessionId={sessionId} 
            language={language} 
            patientName={patientName}
            surgeryName={surgeryName}
            onSuccess={handleVoiceSuccess}
            kinName={kinName}
            kinRelation={kinRelation}
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
                onClick={downloadPDF}
                className="w-full py-3 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Legal Consent Template (PDF)
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
