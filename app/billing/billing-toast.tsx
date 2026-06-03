"use client";

import { notifyCreditsUpdated } from "@/components/auth/credits-badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function BillingToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (searchParams.get("canceled") === "1") {
      toast.message("결제가 취소되었습니다.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (handled.current) return;
    if (searchParams.get("success") !== "1") return;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      toast.warning(
        "결제는 완료됐지만 세션 ID가 없습니다. stripe listen 또는 결제를 다시 시도해 주세요.",
      );
      return;
    }

    handled.current = true;

    const run = async () => {
      toast.message("결제 확인 중… 크레딧을 반영합니다.");

      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          balance?: number;
          credits?: number;
          alreadyProcessed?: boolean;
          error?: string;
        };

        if (!res.ok) {
          toast.error(data.error ?? "크레딧 충전 확인에 실패했습니다.");
          return;
        }

        notifyCreditsUpdated();
        router.refresh();

        if (data.alreadyProcessed) {
          toast.success(`이미 반영된 결제입니다. 잔액 ${data.balance}크레딧`);
        } else {
          toast.success(
            `충전 완료! +${data.credits}크레딧 (잔액 ${data.balance})`,
          );
        }
      } catch {
        toast.error("결제 확인 요청에 실패했습니다.");
      }
    };

    void run();
  }, [searchParams, router]);

  return null;
}
