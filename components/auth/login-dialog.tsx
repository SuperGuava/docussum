"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { cn } from "@/lib/utils";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
  title?: string;
  description?: string;
};

export function LoginDialog({
  open,
  onOpenChange,
  redirectPath = "/dashboard",
  title = "로그인이 필요합니다",
  description = "요약을 저장하고 히스토리를 보려면 Google 계정으로 로그인해 주세요.",
}: LoginDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="닫기"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 id="login-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <GoogleSignInButton
          redirectPath={redirectPath}
          className="w-full"
          size="lg"
        />
      </div>
    </div>
  );
}
