"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CreditsBadgeProps = {
  initialCredits?: number;
};

export function CreditsBadge({ initialCredits }: CreditsBadgeProps) {
  const [credits, setCredits] = useState<number | null>(
    initialCredits ?? null,
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/credits", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { credits?: number };
      if (typeof data.credits === "number") {
        setCredits(data.credits);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => void refresh();
    window.addEventListener("docusumm:credits-updated", onUpdate);
    return () => window.removeEventListener("docusumm:credits-updated", onUpdate);
  }, [refresh]);

  const label = credits === null ? "크레딧 …" : `크레딧 ${credits}`;

  return (
    <Link
      href="/billing"
      className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium tabular-nums hover:bg-muted"
      title="크레딧 충전"
    >
      {label}
    </Link>
  );
}

export function notifyCreditsUpdated(): void {
  window.dispatchEvent(new Event("docusumm:credits-updated"));
}
