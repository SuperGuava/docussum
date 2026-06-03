import type { SummaryResultV1 } from "@/types/summary";

import {
  extractErrorMessage,
  isApiKeyError,
  isTokenOrLengthLimitError,
  isYouTubeAccessError,
} from "./extract-error";

export function getResponseText(text: string | undefined): string {
  if (!text) {
    throw new GeminiSummaryError("요약 결과가 비어 있습니다.", "parse");
  }
  return text;
}

export class GeminiSummaryError extends Error {
  constructor(
    message: string,
    public readonly code: "parse" | "token" | "api" = "api",
    public readonly detail?: string,
  ) {
    super(message);
    this.name = "GeminiSummaryError";
  }
}

export function parseSummaryJson(raw: string): SummaryResultV1 {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new GeminiSummaryError(
      "요약 결과를 파싱하지 못했습니다.",
      "parse",
    );
  }

  let parsed: {
    title?: string;
    tldr?: string[];
    body?: string;
  };

  try {
    parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
  } catch {
    throw new GeminiSummaryError(
      "요약 결과 JSON 형식이 올바르지 않습니다.",
      "parse",
    );
  }

  if (!parsed.title || !parsed.body || !Array.isArray(parsed.tldr)) {
    throw new GeminiSummaryError(
      "요약 결과에 필수 필드가 없습니다.",
      "parse",
    );
  }

  const tldr = parsed.tldr.filter(Boolean).slice(0, 3);
  while (tldr.length < 3) {
    tldr.push("");
  }

  return {
    title: parsed.title,
    tldr,
    body: parsed.body,
  };
}

export function mapGeminiError(error: unknown): GeminiSummaryError {
  const detail = extractErrorMessage(error);

  if (isApiKeyError(detail)) {
    return new GeminiSummaryError(
      "Gemini API 키가 올바르지 않습니다. .env.local의 GEMINI_API_KEY를 AI Studio에서 새로 발급한 키로 바꾼 뒤 dev 서버를 재시작하세요.",
      "api",
      detail,
    );
  }

  if (isTokenOrLengthLimitError(detail)) {
    return new GeminiSummaryError(
      "입력이 너무 깁니다. 텍스트는 분량을 줄이거나, YouTube는 더 짧은 영상으로 시도해 주세요.",
      "token",
      detail,
    );
  }

  if (isYouTubeAccessError(detail)) {
    return new GeminiSummaryError(
      "비공개이거나 접근할 수 없는 YouTube 영상입니다.",
      "api",
      detail,
    );
  }

  if (
    detail.toLowerCase().includes("not supported") ||
    detail.toLowerCase().includes("unsupported")
  ) {
    return new GeminiSummaryError(
      "이 입력 형식은 현재 모델에서 지원되지 않습니다. GEMINI_MODEL을 gemini-2.5-flash로 설정해 보세요.",
      "api",
      detail,
    );
  }

  return new GeminiSummaryError(
    detail.length > 200
      ? `${detail.slice(0, 200)}…`
      : detail || "요약 처리 중 오류가 발생했습니다.",
    "api",
    detail,
  );
}
