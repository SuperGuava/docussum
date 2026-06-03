import { redirect } from "next/navigation";

import { AuthHeader } from "@/components/auth/auth-header";
import { requireDb } from "@/db";
import { ensureUserProfile } from "@/lib/auth/ensure-user";
import { getBalance } from "@/lib/credits/ledger";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/billing");
  }

  const authUser = { id: user.id, email: user.email ?? null };
  await ensureUserProfile(authUser);

  let credits = 0;
  try {
    requireDb();
    credits = await getBalance(authUser.id);
  } catch {
    credits = 0;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader user={authUser} credits={credits} />
      {children}
    </div>
  );
}
