import { eq } from "drizzle-orm";

import { requireDb } from "@/db";
import { summaries } from "@/db/schema";
import { summarizeContent } from "@/lib/gemini/summarize";
import { structuredSummaryToStorage } from "@/lib/gemini/parse-structured";
import { notifySummaryCompleteByEmail } from "@/lib/resend/send-summary-complete";
import {
  DEFAULT_SUMMARY_OPTIONS,
  type SourceType,
  type SummaryOptions,
} from "@/types/summary";

export async function processSummaryJob(
  summaryId: string,
  sourceType: SourceType,
  content: string,
  options: SummaryOptions = DEFAULT_SUMMARY_OPTIONS,
) {
  const database = requireDb();

  try {
    const result = await summarizeContent(sourceType, content, options);

    await database
      .update(summaries)
      .set({
        status: "completed",
        title: result.title,
        summaryText: structuredSummaryToStorage(result),
        metadata: result.metadata ? JSON.stringify(result.metadata) : null,
        schemaVersion: "v2",
        errorMessage: null,
      })
      .where(eq(summaries.id, summaryId));

    try {
      await notifySummaryCompleteByEmail(summaryId, result);
    } catch (emailErr) {
      console.error(
        "[process-summary] email notification failed:",
        emailErr instanceof Error ? emailErr.message : emailErr,
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "요약 처리에 실패했습니다.";

    await database
      .update(summaries)
      .set({
        status: "failed",
        errorMessage: message,
      })
      .where(eq(summaries.id, summaryId));
  }
}
