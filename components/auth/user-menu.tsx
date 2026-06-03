"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type AuthUserSummary = {
  id: string;
  email: string | null;
};

type UserMenuProps = {
  user: AuthUserSummary;
};

export function UserMenu({ user }: UserMenuProps) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/signout";
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:inline"
        title={user.email ?? user.id}
      >
        {user.email ?? "로그인됨"}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="size-3.5" />
        로그아웃
      </Button>
    </div>
  );
}
