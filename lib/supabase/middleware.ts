import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/billing",
  "/api/summary",
  "/api/payment",
  // /api/payment/confirm — 로그인 필요
  "/api/user",
  "/api/health",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** 세션 갱신 + 보호 라우트(대시보드·요약 API) + 루트 리다이렉트 */
export async function handleSupabaseMiddleware(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(user) && !authError;

  if (isProtectedPath(pathname) && !isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = isAuthenticated ? "/dashboard" : "/login";
    target.search = "";
    return NextResponse.redirect(target);
  }

  return supabaseResponse;
}
