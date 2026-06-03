import { requireDb } from "@/db";
import { users } from "@/db/schema";

export type AuthProfileInput = {
  id: string;
  email: string | null | undefined;
};

/** 로그인 사용자 → public.users 행 생성 (FR003: 신규 3 크레딧) */
export async function ensureUserProfile(input: AuthProfileInput): Promise<void> {
  const database = requireDb();
  const email = input.email?.trim() || "user@docusumm.local";

  await database
    .insert(users)
    .values({
      id: input.id,
      email,
      credits: 3,
    })
    .onConflictDoNothing();
}
