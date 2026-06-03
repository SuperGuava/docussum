import { z } from "zod";

import { AuthError } from "@/lib/auth/errors";
import { requireAuthUser } from "@/lib/auth/get-user";
import { resolveCreditPackage } from "@/lib/credits/packages";
import { getStripe } from "@/lib/stripe/client";

const bodySchema = z.object({
  packageId: z.string().min(1),
});

function getOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/auth\/callback$/, "") ??
    "http://localhost:3002";
}

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

    const pkg = resolveCreditPackage(parsed.data.packageId);
    if (!pkg) {
      return Response.json(
        { error: "유효하지 않은 패키지이거나 Price ID가 설정되지 않았습니다." },
        { status: 400 },
      );
    }

    const origin = getOrigin(request);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      success_url: `${origin}/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?canceled=1`,
      client_reference_id: userId,
      metadata: {
        userId,
        packageId: pkg.id,
        credits: String(pkg.credits),
      },
      payment_intent_data: {
        metadata: {
          userId,
          packageId: pkg.id,
          credits: String(pkg.credits),
        },
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Checkout URL을 생성하지 못했습니다." },
        { status: 500 },
      );
    }

    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "결제 세션 생성에 실패했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
