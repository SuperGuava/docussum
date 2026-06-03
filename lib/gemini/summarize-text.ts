import type { SummaryOptions, StructuredSummary } from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

import { TEXT_INPUT_MAX_CHARS } from "./client";
import { GeminiSummaryError } from "./parse-response";
import { summarizeContent } from "./summarize";

/** @deprecated Use summarizeContent */
export async function summarizeText(
  content: string,
  options: SummaryOptions = DEFAULT_SUMMARY_OPTIONS,
): Promise<StructuredSummary> {
  if (content.length > TEXT_INPUT_MAX_CHARS) {
    throw new GeminiSummaryError(
      `텍스트가 너무 깁니다 (최대 ${TEXT_INPUT_MAX_CHARS.toLocaleString()}자). 내용을 나누어 요약해 주세요.`,
      "token",
    );
  }
  return summarizeContent("text", content, options);
}
