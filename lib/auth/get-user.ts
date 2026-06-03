import { createClient } from "@/lib/supabase/server";

import { ensureUserProfile } from "./ensure-user";
import { AuthError } from "./errors";

export type AuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

/** API Route: 로그인 필수 + public.users 프로필 보장 */
export async function requireAuthUser(): Promise<AuthUser> {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new AuthError();
  }

  await ensureUserProfile(authUser);
  return authUser;
}
