import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate patient-friendly risk bullet points in the target language.
 * Returns { bullets: string[], duration_sec: number }
 */
export async function generateRiskBullets(surgeryName, risksArray, language) {
  const risks = Array.isArray(risksArray) ? risksArray : JSON.parse(risksArray);

  const systemPrompt =
    'You are a medical translator and patient educator. You NEVER give medical advice or diagnosis.';

  const userPrompt = `Take these risks for ${surgeryName}:
${risks.join('\n')}

Rewrite each in ${language} for 8th-grade education level.
1 short sentence per risk. No advice. No diagnosis. No English words if language is not English.
Output ONLY valid JSON: { "bullets": ["...", "...", "...", "...", "..."], "duration_sec": 90 }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,

      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    let text = response.text;
    if (typeof text === 'function') {
      text = response.text();
    }

    // Strip markdown json fences if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const parsed = JSON.parse(text);

    if (!parsed.bullets || !Array.isArray(parsed.bullets)) {
      throw new Error('Gemini response missing bullets array');
    }

    return parsed;
  } catch (error) {
    console.error('[Gemini] Risk bullet generation failed:', error.message);
    console.warn('[Gemini] Using fallback generic bullets...');
    
    // Fallback: return generic translated bullets (language-aware)
    const languageMap = {
      'bhojpuri': [
        'सर्जरी के समय खून बहना हो सकता है।',
        'ऑपरेशन के बाद संक्रमण की समभावना है।',
        'पास के अंगों को चोट पहुँच सकती है।',
        'एनेस्थीसिया से एलर्जी हो सकती है।',
        'ऑपरेशन के महीनों बाद खून का थक्का बन सकता है।',
      ],
      'maithili': [
        'शल्य-चिकित्साय ख़ून बहि सकैत अछि।',
        'ऑपरेशनक बाद संक्रमण भय अछि।',
        'आस-पास क अंग क चोट लग सकैत अछि।',
        'एनेस्थीसिया सँ एलर्जी भय सकैत अछि।',
        'ऑपरेशनक बाद खून क थक्का बन सकैत अछि।',
      ],
      'hindi': [
        'सर्जरी के दौरान रक्तस्राव हो सकता है।',
        'ऑपरेशन के बाद संक्रमण की संभावना है।',
        'पास के अंगों को चोट लग सकती है।',
        'एनेस्थीसिया से एलर्जी हो सकती है।',
        'ऑपरेशन के बाद रक्त के थक्के बन सकते हैं।',
      ],
      'english': [
        'Bleeding may occur during or after surgery.',
        'Infection at the surgical site is possible.',
        'Nearby organs may be injured during the procedure.',
        'Allergic reactions to anesthesia can happen.',
        'Blood clots may form weeks after surgery.',
      ],
    };
    
    const bullets = languageMap[language.toLowerCase()] || languageMap['english'];
    return {
      bullets: bullets.slice(0, Math.min(5, risks.length)),
      duration_sec: 90
    };
  }
}
/**
 * Handle conversational follow-up questions from patients.
 */
export async function getChatResponse(userQuery, context, language) {
  const { surgeryName, risks, benefits } = context;

  const systemPrompt = `You are a medical patient educator named ConsentLens AI. 
You are speaking to a patient who just watched an education video about their ${surgeryName} surgery.
CONTEXT:
- Procedure: ${surgeryName}
- Risks covered: ${risks.join(', ')}
- Benefits: ${benefits}

RULES:
1. Answer in ${language} ONLY.
2. Be extremely empathetic, simple (8th grade level), and reassuring but honest.
3. NEVER diagnose or suggest alternative treatments.
4. If asked about something outside the surgery context, gracefully redirect them to speak with their surgeon.
5. Keep answers under 3 sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    let text = response.text;
    if (typeof text === 'function') {
      text = response.text();
    }
    return text.trim();
  } catch (error) {
    console.error('[Gemini] Chat failure:', error.message);
    return `I am sorry, I am having trouble answering right now. Please ask Dr. Sharma directly during your consultation.`;
  }
}
