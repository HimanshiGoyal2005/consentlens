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
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}
