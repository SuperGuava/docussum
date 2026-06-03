"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatAuthErrorMessage } from "@/lib/supabase/auth-errors";

type GoogleSignInButtonProps = {
  redirectPath?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function GoogleSignInButton({
  redirectPath = "/dashboard",
  className,
  size = "lg",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const next = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
      document.cookie = `docusumm_auth_next=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
      const redirectTo = `${origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      toast.error("Google 로그인 URL을 받지 못했습니다. Supabase Redirect URL을 확인하세요.");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(formatAuthErrorMessage(err));
    }
  };

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={loading}
      onClick={() => void handleSignIn()}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          연결 중...
        </>
      ) : (
        "Google로 계속하기"
      )}
    </Button>
  );
}
