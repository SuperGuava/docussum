"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ResolvedCreditPackage } from "@/lib/credits/packages";

type CreditPackageCardProps = {
  pkg: ResolvedCreditPackage;
};

export function CreditPackageCard({ pkg }: CreditPackageCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "결제를 시작하지 못했습니다.");
      }

      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "결제를 시작하지 못했습니다.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">크레딧 패키지</p>
      <p className="mt-1 text-3xl font-bold">{pkg.label}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        요약 {pkg.credits}회 · ${pkg.priceUsd}
      </p>
      <Button
        type="button"
        className="mt-6 w-full"
        disabled={loading}
        onClick={() => void handleCheckout()}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            이동 중...
          </>
        ) : (
          "결제하기"
        )}
      </Button>
    </div>
  );
}
