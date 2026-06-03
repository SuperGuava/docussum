import type { GoogleGenAI } from "@google/genai";

import { getGeminiModelCandidates } from "./client";
import {
  extractErrorMessage,
  isRetryableCapacityError,
} from "./extract-error";
import { mapGeminiError } from "./parse-response";

const MAX_ATTEMPTS_PER_MODEL = 3;
const BASE_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GenerateContentParams = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

/**
 * 모델별 지수 백오프 재시도 후, 후보 모델 목록을 순서대로 시도합니다.
 */
export async function generateContentWithResilience(
  ai: GoogleGenAI,
  buildParams: (model: string) => GenerateContentParams,
) {
  const models = getGeminiModelCandidates();
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        return await ai.models.generateContent(buildParams(model));
      } catch (error) {
        lastError = error;
        const detail = extractErrorMessage(error);

        if (!isRetryableCapacityError(detail)) {
          throw mapGeminiError(error);
        }

        const isLastAttempt = attempt === MAX_ATTEMPTS_PER_MODEL - 1;
        const isLastModel = model === models[models.length - 1];

        if (!isLastAttempt) {
          await sleep(BASE_DELAY_MS * 2 ** attempt);
          continue;
        }

        if (!isLastModel) {
          console.warn(
            `[gemini] ${model} capacity error, trying fallback model. detail=${detail.slice(0, 120)}`,
          );
          break;
        }
      }
    }
  }

  throw mapGeminiError(lastError);
}
