import type { SourceType } from "@/types/summary";

import {
  extractFirstYouTubeWatchUrl,
  isValidYouTubeUrl,
  shouldCoerceTextInputToYouTube,
  toCanonicalYouTubeWatchUrl,
} from "./validate";

export type ResolvedSummaryInput = {
  sourceType: SourceType;
  content: string;
  /** 텍스트 탭에서 YouTube로 자동 전환된 경우 */
  coercedFromText: boolean;
};

/**
 * YouTube URL은 항상 canonical watch URL + sourceType youtube 로 처리.
 * 텍스트 탭: URL만 또는 URL+짧은 안내 문구 → youtube 강제.
 * YouTube 탭: 입력에서 첫 URL 추출(앞뒤 문구 허용).
 */
export function resolveSummaryInput(
  sourceType: SourceType,
  content: string,
): ResolvedSummaryInput {
  const trimmed = content.trim();

  if (sourceType === "youtube") {
    const extracted = extractFirstYouTubeWatchUrl(trimmed);
    if (extracted) {
      return {
        sourceType: "youtube",
        content: extracted,
        coercedFromText: false,
      };
    }
    if (isValidYouTubeUrl(trimmed)) {
      return {
        sourceType: "youtube",
        content: toCanonicalYouTubeWatchUrl(trimmed),
        coercedFromText: false,
      };
    }
    return { sourceType: "youtube", content: trimmed, coercedFromText: false };
  }

  if (shouldCoerceTextInputToYouTube(trimmed)) {
    const watchUrl =
      extractFirstYouTubeWatchUrl(trimmed) ??
      toCanonicalYouTubeWatchUrl(trimmed);
    return {
      sourceType: "youtube",
      content: watchUrl,
      coercedFromText: true,
    };
  }

  return { sourceType: "text", content: trimmed, coercedFromText: false };
}
