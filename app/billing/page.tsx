import Link from "next/link";
import { Suspense } from "react";

import { CreditPackageCard } from "@/components/payment/credit-package-card";
import { buttonVariants } from "@/components/ui/button";
import { listResolvablePackages } from "@/lib/credits/packages";
import { cn } from "@/lib/utils";

import { BillingToast } from "./billing-toast";

export default function BillingPage() {
  const packages = listResolvablePackages();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Suspense fallback={null}>
        <BillingToast />
      </Suspense>

      <div className="mb-8">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4")}
        >
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-bold">크레딧 충전</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stripe Checkout으로 안전하게 결제합니다. 결제 완료 후 웹훅을 통해
          크레딧이 반영됩니다 (수 초 소요될 수 있습니다).
        </p>
      </div>

      {packages.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Stripe Price ID가 설정되지 않았습니다. `.env.local`에
          `STRIPE_PRICE_ID_30` 등을 확인하세요.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <CreditPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        테스트 카드: 4242 4242 4242 4242 · 로컬 웹훅:{" "}
        <code className="rounded bg-muted px-1">
          stripe listen --forward-to localhost:3002/api/webhooks/stripe
        </code>
      </p>
    </main>
  );
}
