import type { SummaryOptions, StructuredSummary } from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

import { summarizeContent } from "./summarize";

/** @deprecated Use summarizeContent */
export async function summarizeYouTube(
  url: string,
  options: SummaryOptions = DEFAULT_SUMMARY_OPTIONS,
): Promise<StructuredSummary> {
  return summarizeContent("youtube", url, options);
}
