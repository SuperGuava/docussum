import { type NextRequest } from "next/server";

import { handleSupabaseMiddleware } from "@/lib/supabase/middleware";

/** Next.js 16+: middleware.ts 대신 proxy.ts 사용 */
export async function proxy(request: NextRequest) {
  return handleSupabaseMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/billing",
    "/billing/:path*",
    "/api/summary/:path*",
    "/api/payment/:path*",
    "/api/user/:path*",
    "/api/health/:path*",
    "/auth/callback",
    "/auth/signout",
  ],
};
