import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { creditTransactions, users } from "@/db/schema";

import { InsufficientCreditsError } from "./errors";

type CreditTransactionType = "bonus" | "charge" | "usage";

type Db = PostgresJsDatabase<typeof schema>;

export type CreditLedgerMeta = {
  stripeCheckoutSessionId?: string;
  stripeEventId?: string;
  note?: string;
};

async function logTransaction(
  database: Db,
  row: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    stripeCheckoutSessionId?: string | null;
    stripeEventId?: string | null;
    note?: string | null;
  },
): Promise<void> {
  try {
    await database.insert(creditTransactions).values({
      userId: row.userId,
      amount: row.amount,
      type: row.type,
      stripeCheckoutSessionId: row.stripeCheckoutSessionId ?? null,
      stripeEventId: row.stripeEventId ?? null,
      note: row.note ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "[ledger] credit_transactions 기록 실패 — `pnpm db:push` 로 Epic4 마이그레이션 적용:",
      message,
    );
  }
}

export async function getBalance(userId: string): Promise<number> {
  const database = requireDb();
  const [row] = await database
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.credits ?? 0;
}

/** 요약 1회 등 사용 — Gemini 호출 전 차감 */
export async function deductCredit(
  userId: string,
  amount = 1,
): Promise<number> {
  const database = requireDb();

  const [user] = await database
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  if (user.credits < amount) {
    throw new InsufficientCreditsError(user.credits);
  }

  const newBalance = user.credits - amount;

  await database
    .update(users)
    .set({ credits: newBalance })
    .where(eq(users.id, userId));

  await logTransaction(database, {
    userId,
    amount: -amount,
    type: "usage",
    note: "summary",
  });

  return newBalance;
}

/** 충전·보너스 — session/event ID로 멱등 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  meta?: CreditLedgerMeta,
): Promise<{ balance: number; alreadyProcessed: boolean }> {
  if (amount <= 0) {
    throw new Error("addCredits: amount must be positive");
  }

  const database = requireDb();

  try {
    if (meta?.stripeCheckoutSessionId) {
      const [existing] = await database
        .select({ id: creditTransactions.id })
        .from(creditTransactions)
        .where(
          eq(
            creditTransactions.stripeCheckoutSessionId,
            meta.stripeCheckoutSessionId,
          ),
        )
        .limit(1);
      if (existing) {
        return { balance: await getBalance(userId), alreadyProcessed: true };
      }
    }

    if (meta?.stripeEventId) {
      const [existing] = await database
        .select({ id: creditTransactions.id })
        .from(creditTransactions)
        .where(eq(creditTransactions.stripeEventId, meta.stripeEventId))
        .limit(1);
      if (existing) {
        return { balance: await getBalance(userId), alreadyProcessed: true };
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[ledger] 멱등 조회 실패 (credit_transactions 없음?):", message);
  }

  const [user] = await database
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const newBalance = user.credits + amount;

  await database
    .update(users)
    .set({ credits: newBalance })
    .where(eq(users.id, userId));

  await logTransaction(database, {
    userId,
    amount,
    type,
    stripeCheckoutSessionId: meta?.stripeCheckoutSessionId,
    stripeEventId: meta?.stripeEventId,
    note: meta?.note ?? null,
  });

  return { balance: newBalance, alreadyProcessed: false };
}
