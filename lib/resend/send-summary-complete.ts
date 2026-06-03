import { render } from "@react-email/render";
import { eq } from "drizzle-orm";

import { requireDb } from "@/db";
import { summaries, users } from "@/db/schema";
import { SummaryCompleteEmail } from "@/emails/summary-complete";
import { dashboardSummaryUrl } from "@/lib/app-url";
import type { StructuredSummary } from "@/types/summary";

import {
  getResend,
  getResendFromAddress,
  isResendConfigured,
} from "./client";

export type SendSummaryCompleteInput = {
  summaryId: string;
  recipientEmail: string;
  title: string;
  tldr: [string, string, string];
};

export function buildSummaryCompleteSubject(title: string): string {
  const safeTitle = title.trim() || "요약";
  return `[DocuSumm] 요약이 완료되었습니다: ${safeTitle}`;
}

export async function sendSummaryCompleteEmail(
  input: SendSummaryCompleteInput,
): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!isResendConfigured()) {
    return { sent: false, skipped: "RESEND_API_KEY not configured" };
  }

  const dashboardUrl = dashboardSummaryUrl(input.summaryId);
  const html = await render(
    SummaryCompleteEmail({
      title: input.title,
      tldr: input.tldr,
      dashboardUrl,
    }),
  );

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: input.recipientEmail,
      subject: buildSummaryCompleteSubject(input.title),
      html,
    });

    if (error) {
      console.error("[resend] summary complete email failed:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resend] summary complete email error:", message);
    return { sent: false, error: message };
  }
}

/** 요약 완료 후 사용자 이메일로 알림 (실패해도 요약 상태는 유지) */
export async function notifySummaryCompleteByEmail(
  summaryId: string,
  result: StructuredSummary,
): Promise<void> {
  const database = requireDb();

  const [row] = await database
    .select({
      userId: summaries.userId,
    })
    .from(summaries)
    .where(eq(summaries.id, summaryId))
    .limit(1);

  if (!row) return;

  const [profile] = await database
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, row.userId))
    .limit(1);

  const email = profile?.email?.trim();
  if (!email) {
    console.warn(
      `[resend] skip email: no user email for summary ${summaryId}`,
    );
    return;
  }

  await sendSummaryCompleteEmail({
    summaryId,
    recipientEmail: email,
    title: result.title,
    tldr: result.tldr,
  });
}
