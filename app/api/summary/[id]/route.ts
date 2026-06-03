import { and, eq } from "drizzle-orm";

import { requireDb } from "@/db";
import { summaries } from "@/db/schema";
import { AuthError } from "@/lib/auth/errors";
import { requireAuthUser } from "@/lib/auth/get-user";
import { toSummaryDetail } from "@/lib/summary/serialize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { id: userId } = await requireAuthUser();
    const database = requireDb();

    const [row] = await database
      .select()
      .from(summaries)
      .where(and(eq(summaries.id, id), eq(summaries.userId, userId)))
      .limit(1);

    if (!row) {
      return Response.json({ error: "요약을 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json(toSummaryDetail(row));
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "요약을 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 503 });
  }
}
