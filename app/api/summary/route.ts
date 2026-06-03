import { after } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { requireDb } from "@/db";
import { summaries } from "@/db/schema";
import { AuthError } from "@/lib/auth/errors";
import { requireAuthUser } from "@/lib/auth/get-user";
import { InsufficientCreditsError } from "@/lib/credits/errors";
import { deductCredit } from "@/lib/credits/ledger";
import { processSummaryJob } from "@/lib/summary/process-summary";
import { toSummaryDetail } from "@/lib/summary/serialize";
import { resolveSummaryInput } from "@/lib/youtube/resolve-input";
import { isValidYouTubeUrl } from "@/lib/youtube/validate";
import { dbErrorHint, formatDbError } from "@/lib/db/format-db-error";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

const optionsSchema = z
  .object({
    length: z.enum(["short", "default", "long"]).optional(),
    tone: z.enum(["default", "easy"]).optional(),
  })
  .optional();

const createSchema = z.object({
  sourceType: z.enum(["text", "youtube"]),
  content: z.string().min(1, "내용을 입력해 주세요."),
  options: optionsSchema,
});

export async function GET() {
  try {
    const { id: userId } = await requireAuthUser();
    const database = requireDb();

    const rows = await database
      .select({
        id: summaries.id,
        title: summaries.title,
        sourceType: summaries.sourceType,
        status: summaries.status,
        createdAt: summaries.createdAt,
      })
      .from(summaries)
      .where(eq(summaries.userId, userId))
      .orderBy(desc(summaries.createdAt))
      .limit(50);

    return Response.json({
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        sourceType: row.sourceType,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "목록을 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const { id: userId } = await requireAuthUser();
    const database = requireDb();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." },
        { status: 400 },
      );
    }

    const { options: rawOptions } = parsed.data;
    const resolved = resolveSummaryInput(
      parsed.data.sourceType,
      parsed.data.content,
    );
    const { sourceType, content } = resolved;

    const options = {
      length: rawOptions?.length ?? DEFAULT_SUMMARY_OPTIONS.length,
      tone: rawOptions?.tone ?? DEFAULT_SUMMARY_OPTIONS.tone,
    };

    if (sourceType === "youtube" && !isValidYouTubeUrl(content)) {
      return Response.json(
        { error: "유효한 YouTube URL을 입력해 주세요." },
        { status: 400 },
      );
    }

    await deductCredit(userId, 1);

    const [inserted] = await database
      .insert(summaries)
      .values({
        userId,
        sourceType,
        originalContent: content,
        status: "pending",
        summaryOptions: options,
        schemaVersion: "v2",
      })
      .returning({ id: summaries.id });

    const summaryId = inserted.id;

    after(async () => {
      await processSummaryJob(summaryId, sourceType, content, options);
    });

    return Response.json({ summaryId }, { status: 202 });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          error: error.message,
          code: error.code,
          credits: error.credits,
        },
        { status: 402 },
      );
    }
    const message = formatDbError(error);
    return Response.json(
      { error: `${message}${dbErrorHint(message)}` },
      { status: 503 },
    );
  }
}
