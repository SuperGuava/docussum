"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InsufficientCreditsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function InsufficientCreditsDialog({
  open,
  onClose,
}: InsufficientCreditsDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insufficient-credits-title"
    >
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 id="insufficient-credits-title" className="text-lg font-semibold">
          크레딧이 부족합니다
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          요약 1회당 크레딧 1개가 필요합니다. 충전 후 다시 시도해 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Link
            href="/billing"
            className={cn(buttonVariants({ variant: "default" }))}
            onClick={onClose}
          >
            크레딧 충전
          </Link>
        </div>
      </div>
    </div>
  );
}
