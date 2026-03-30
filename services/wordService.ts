/**
 * Word Data Service
 *
 * Strategy:
 * 1. Check Firestore cache for word
 * 2. If found → return instantly (free, no AI cost)
 * 3. If not found → call Gemini → store in Firestore → return
 *
 * This means every word is AI-processed exactly ONCE across all users.
 */

import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface WordData {
  word: string;
  eli5: string;
  exampleSentence: string;
  hindiTranslation: string;
  partOfSpeech: string;
  phonetic: string;
  fetchedAt?: unknown;
  fetchCount?: number;
  fromCache: boolean;
}

/**
 * Main entry point – call this from the UI.
 * Returns complete WordData or throws an error.
 */
export async function lookupWord(rawWord: string, geminiApiKey: string): Promise<WordData> {
  const word = rawWord.trim().toLowerCase();

  if (!word) throw new Error('No word provided');

  // ── Step 1: Check Firestore cache ─────────────────────────────────────
  const docRef = doc(db, 'words', word);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as WordData;
    // Increment usage counter without blocking the response
    setDoc(docRef, { fetchCount: increment(1) }, { merge: true }).catch(() => {});
    return { ...data, fromCache: true };
  }

  // ── Step 2: Call Gemini API ───────────────────────────────────────────
  const generated = await callGemini(word, geminiApiKey);

  // ── Step 3: Persist to Firestore ──────────────────────────────────────
  const wordData: Omit<WordData, 'fromCache'> = {
    word,
    eli5: generated.eli5,
    exampleSentence: generated.exampleSentence,
    hindiTranslation: generated.hindiTranslation,
    partOfSpeech: generated.partOfSpeech,
    phonetic: generated.phonetic ?? '',
    fetchedAt: serverTimestamp(),
    fetchCount: 1,
  };

  await setDoc(docRef, wordData);

  return { ...wordData, fromCache: false };
}

// ── Gemini Integration ────────────────────────────────────────────────────────

interface GeminiWordResponse {
  eli5: string;
  exampleSentence: string;
  hindiTranslation: string;
  partOfSpeech: string;
  phonetic: string;
}

async function callGemini(word: string, apiKey: string): Promise<GeminiWordResponse> {
  const MODEL = 'gemini-2.0-flash-lite';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const prompt = `You are a friendly dictionary assistant. A user searched for the English word: "${word}"

Return a valid JSON object with EXACTLY these fields and nothing else:
{
  "eli5": "Explain the word in 2-3 simple sentences as if talking to a 10-year-old. No jargon. No complex words.",
  "exampleSentence": "One short, natural, modern sentence using the word "${word}" in context.",
  "hindiTranslation": "The best Hindi translation in Devanagari script (e.g. पानी)",
  "partOfSpeech": "noun",
  "phonetic": "Simple phonetic spelling like how it sounds (e.g. am-biff-ee-us)"
}

Rules:
- ELI5 must feel like a smart friend explaining, NOT a textbook.
- Use simple, everyday language a kid would understand.
- Phonetic must be in easy English syllables (not IPA symbols).
- Return ONLY the JSON object. No markdown. No extra text.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const rawText: string =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip possible markdown code fences
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as GeminiWordResponse;

  return parsed;
}
