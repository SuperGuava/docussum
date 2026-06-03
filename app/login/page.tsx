import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
    detail?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (user && session) {
    redirect(nextPath);
  }

  const callbackHint = getAuthCallbackUrl(await headers());

  const errorMessage =
    params.error === "auth_callback_error"
      ? [
          "로그인 처리 중 오류가 발생했습니다.",
          params.detail ? `(${params.detail})` : null,
          `Supabase → Authentication → URL Configuration에 Redirect URL을 등록하세요: ${callbackHint}`,
          "실제 접속 포트(예: 3002)와 Site URL이 일치해야 합니다.",
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
          <div className="text-center">
            <Link href="/" className="text-xl font-semibold">
              DocuSumm
            </Link>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              로그인
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Google 계정으로 로그인하고 AI 요약을 저장하세요.
            </p>
          </div>

          {errorMessage && (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <GoogleSignInButton redirectPath={nextPath} className="w-full" />

          <p className="text-center text-xs text-muted-foreground">
            신규 가입 시 무료 크레딧 3회가 제공됩니다.
          </p>
          <p className="text-center text-sm">
            <a href="/auth/signout" className="text-muted-foreground underline">
              다른 계정으로 로그인 (세션 초기화)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
