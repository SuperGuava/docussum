import Link from "next/link";

import { CreditsBadge } from "@/components/auth/credits-badge";
import { buttonVariants } from "@/components/ui/button";
import type { AuthUserSummary } from "@/components/auth/user-menu";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

type AuthHeaderProps = {
  user: AuthUserSummary | null;
  credits?: number;
  showLoginLink?: boolean;
};

export function AuthHeader({
  user,
  credits,
  showLoginLink = true,
}: AuthHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        DocuSumm
      </Link>
      <div className="flex items-center gap-2">
        {user ? <CreditsBadge initialCredits={credits} /> : null}
        {user ? (
          <UserMenu user={user} />
        ) : showLoginLink ? (
          <Link
            href="/login?next=/dashboard"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            로그인
          </Link>
        ) : null}
      </div>
    </header>
  );
}
