import { NextResponse, type NextRequest } from "next/server";

import { ensureUserProfile } from "@/lib/auth/ensure-user";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

const AUTH_NEXT_COOKIE = "docusumm_auth_next";

function resolveNextPath(request: NextRequest, queryNext: string | null): string {
  const fromQuery = queryNext?.startsWith("/") ? queryNext : null;
  if (fromQuery) return fromQuery;

  const fromCookie = request.cookies.get(AUTH_NEXT_COOKIE)?.value;
  if (fromCookie) {
    try {
      const decoded = decodeURIComponent(fromCookie);
      if (decoded.startsWith("/")) return decoded;
    } catch {
      /* ignore */
    }
  }
  return "/dashboard";
}

function loginErrorRedirect(
  origin: string,
  safeNext: string,
  detail?: string,
): NextResponse {
  const url = new URL("/login", origin);
  url.searchParams.set("error", "auth_callback_error");
  url.searchParams.set("next", safeNext);
  if (detail) {
    url.searchParams.set("detail", detail.slice(0, 200));
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;
  const safeNext = resolveNextPath(request, requestUrl.searchParams.get("next"));

  if (oauthError) {
    return loginErrorRedirect(origin, safeNext, oauthError);
  }

  if (!code) {
    return loginErrorRedirect(origin, safeNext, "인증 코드가 없습니다.");
  }

  const redirectUrl = new URL(safeNext, origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginErrorRedirect(origin, safeNext, error.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await ensureUserProfile({ id: user.id, email: user.email });
  }

  response.cookies.set(AUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
