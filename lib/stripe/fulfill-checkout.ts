import type Stripe from "stripe";

import { addCredits } from "@/lib/credits/ledger";
import { findCreditPackageById } from "@/lib/credits/packages";
import { getStripe } from "@/lib/stripe/client";

function paymentSucceeded(session: Stripe.Checkout.Session): boolean {
  if (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  ) {
    return true;
  }

  const pi = session.payment_intent;
  if (typeof pi === "object" && pi !== null && "status" in pi) {
    return pi.status === "succeeded";
  }

  return session.status === "complete";
}

function readMetadata(session: Stripe.Checkout.Session): {
  userId: string | undefined;
  packageId: string | undefined;
  creditsRaw: string | undefined;
} {
  const pi = session.payment_intent;
  const piMeta =
    typeof pi === "object" && pi !== null && "metadata" in pi
      ? (pi.metadata as Record<string, string | undefined>)
      : undefined;

  return {
    userId:
      session.metadata?.userId ??
      piMeta?.userId ??
      session.client_reference_id ??
      undefined,
    packageId: session.metadata?.packageId ?? piMeta?.packageId,
    creditsRaw: session.metadata?.credits ?? piMeta?.credits,
  };
}

export async function loadCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export type FulfillOutcome = {
  ok: boolean;
  reason?: string;
  balance?: number;
  credits?: number;
  alreadyProcessed?: boolean;
};

/** Webhook·결제 복귀 확인 API 공통 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  idempotencyKey: string,
  expectedUserId?: string,
): Promise<FulfillOutcome> {
  const full = await loadCheckoutSession(session.id);

  const { userId, packageId, creditsRaw } = readMetadata(full);

  if (!userId || !packageId || !creditsRaw) {
    return { ok: false, reason: "missing_metadata" };
  }

  if (expectedUserId && userId !== expectedUserId) {
    return { ok: false, reason: "user_mismatch" };
  }

  const pkg = findCreditPackageById(packageId);
  const credits = Number.parseInt(creditsRaw, 10);

  if (!pkg || credits !== pkg.credits) {
    return {
      ok: false,
      reason: `package_mismatch:${packageId}:${credits}`,
    };
  }

  if (
    full.client_reference_id &&
    full.client_reference_id !== userId
  ) {
    return { ok: false, reason: "client_reference_mismatch" };
  }

  if (!paymentSucceeded(full)) {
    return {
      ok: false,
      reason: `payment_not_ready:${full.payment_status}:${full.status}`,
    };
  }

  const result = await addCredits(userId, credits, "charge", {
    stripeCheckoutSessionId: full.id,
    stripeEventId: idempotencyKey,
    note: packageId,
  });

  console.info("[stripe fulfill] credits applied", {
    sessionId: full.id,
    userId,
    credits,
    balance: result.balance,
    alreadyProcessed: result.alreadyProcessed,
    idempotencyKey,
  });

  return {
    ok: true,
    balance: result.balance,
    credits,
    alreadyProcessed: result.alreadyProcessed,
  };
}
