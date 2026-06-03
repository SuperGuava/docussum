/** Supabase Auth / OAuth 오류 메시지 (한국어) */
export function formatAuthErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "로그인에 실패했습니다.";

  const lower = raw.toLowerCase();

  if (
    lower.includes("invalid api key") ||
    lower.includes("invalid jwt") ||
    lower.includes("apikey")
  ) {
    return "Supabase API 키가 올바르지 않습니다. 대시보드 → Project Settings → API에서 anon(public) JWT 키(eyJ로 시작)를 NEXT_PUBLIC_SUPABASE_ANON_KEY에 넣어 주세요. publishable 키만으로는 Auth가 동작하지 않을 수 있습니다.";
  }

  if (lower.includes("redirect") || lower.includes("url")) {
    return "Redirect URL이 허용되지 않았습니다. Supabase → Authentication → URL Configuration에 로컬(http://localhost:3002/auth/callback)과 프로덕션(https://docussum-orcin.vercel.app/auth/callback)을 추가하세요. docs/deploy/vercel-production.md 참고.";
  }

  return raw || "로그인에 실패했습니다.";
}
