import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); // Uses GEMINI_API_KEY from process.env

export async function POST(request) {
  try {
    const { transcript, language, history, surgeryName } = await request.json();

    const systemPrompt = `You are Dr. Sharma, a warm and professional Indian female doctor explaining a ${surgeryName} to a patient. 
    The patient is speaking in ${language}. Respond in ${language} using simple, empathetic medical terms. 
    Keep responses concise (1-3 sentences) so the audio doesn't take too long to generate. 
    If the patient sounds satisfied, encourage them to click the 'Final Confirmation' button.`;

    const contents = [
      systemPrompt,
      ...history.map(msg => `${msg.role === 'user' ? 'Patient' : 'Dr. Sharma'}: ${msg.content}`),
      `Patient just said: ${transcript}`
    ].join('\n\n');

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
      });
      responseText = response.text;
    } catch (genError) {
      console.warn('[Gemini DNS/Network Issue] Falling back to standard response:', genError.message);
      // Fallback if the user's internet or DNS blocks generativelanguage.googleapis.com
      responseText = language === 'Hindi' 
        ? "मै समझ रही हूँ। क्या आपके पास इसके अलावा कोई और सवाल है, या हम आगे बढ़ें?" 
        : "I understand. Do you have any other questions, or should we proceed?";
    }

    // Removed ElevenLabs TTS to prevent missing_permissions errors and 9-second latency.
    // The frontend VoiceBot will handle TTS natively using browser speechSynthesis.
    return NextResponse.json({ 
      text: responseText, 
      audio: null 
    });

  } catch (error) {
    console.error('[Chat Agent] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
