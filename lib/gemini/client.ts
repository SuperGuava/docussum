import { GoogleGenAI } from "@google/genai";

import { resolveGeminiApiKey } from "./resolve-api-key";

/** Video Understanding·YouTube URL 권장 모델 (env로 덮어쓰기 가능) */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

/** 텍스트 직접 입력 상한 (문자 수, 대략적 가드) */
export const TEXT_INPUT_MAX_CHARS = 120_000;

let client: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getGenAIClient(): GoogleGenAI {
  const apiKey = resolveGeminiApiKey();

  if (client && cachedKey === apiKey) {
    return client;
  }

  client = new GoogleGenAI({ apiKey });
  cachedKey = apiKey;
  return client;
}
