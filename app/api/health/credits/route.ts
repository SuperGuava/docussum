import { sql } from "drizzle-orm";

import { requireDb } from "@/db";
import { requireAuthUser } from "@/lib/auth/get-user";
import { getBalance } from "@/lib/credits/ledger";

export const dynamic = "force-dynamic";

/** 로그인 사용자 기준 DB·크레딧 진단 (개발용) */
export async function GET() {
  try {
    const { id: userId } = await requireAuthUser();
    const database = requireDb();

    let creditTransactionsTable = false;
    try {
      await database.execute(
        sql`SELECT 1 FROM credit_transactions LIMIT 1`,
      );
      creditTransactionsTable = true;
    } catch {
      creditTransactionsTable = false;
    }

    const credits = await getBalance(userId);

    return Response.json({
      userId,
      credits,
      creditTransactionsTable,
      hint: creditTransactionsTable
        ? null
        : "pnpm db:push 로 credit_transactions 테이블을 생성하세요.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "health check failed";
    return Response.json({ error: message }, { status: 503 });
  }
}
