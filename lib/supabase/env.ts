export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.",
    );
  }
  return url;
}

let warnedPublishableOnly = false;

/** Supabase Auth·클라이언트용 공개 키 (anon JWT 권장) */
export function getSupabaseAnonKey(): string {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (anon) {
    if (!anon.startsWith("eyJ") && process.env.NODE_ENV === "development") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY 형식이 잘못되었습니다. 'eyJ'로 시작하는 anon public JWT인지 확인하세요. (앞에 글자가 붙지 않았는지 확인)",
      );
    }
    return anon;
  }

  if (publishable) {
    if (process.env.NODE_ENV === "development" && !warnedPublishableOnly) {
      warnedPublishableOnly = true;
      console.warn(
        "[DocuSumm] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY만 설정됨. Google 로그인 문제 시 anon JWT(eyJ...)를 NEXT_PUBLIC_SUPABASE_ANON_KEY에 추가하세요.",
      );
    }
    return publishable;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY(권장) 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 .env.local에 설정하세요.",
  );
}
