import { z } from "zod";

import { AuthError } from "@/lib/auth/errors";
import { requireAuthUser } from "@/lib/auth/get-user";
import {
  fulfillCheckoutSession,
  loadCheckoutSession,
} from "@/lib/stripe/fulfill-checkout";

const bodySchema = z.object({
  sessionId: z.string().min(1, "sessionId가 필요합니다."),
});

/**
 * Checkout 성공 복귀 시 웹훅 없이도 충전 (로컬 stripe listen 미사용 대비).
 * 멱등: stripeCheckoutSessionId 기준.
 */
export async function POST(request: Request) {
  try {
    const { id: userId } = await requireAuthUser();
    const parsed = bodySchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." },
        { status: 400 },
      );
    }

    const session = await loadCheckoutSession(parsed.data.sessionId);
    const outcome = await fulfillCheckoutSession(
      session,
      `confirm_${parsed.data.sessionId}`,
      userId,
    );

    if (!outcome.ok) {
      return Response.json(
        { error: outcome.reason ?? "충전에 실패했습니다." },
        { status: 400 },
      );
    }

    return Response.json({
      ok: true,
      credits: outcome.credits,
      balance: outcome.balance,
      alreadyProcessed: outcome.alreadyProcessed,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "결제 확인에 실패했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
