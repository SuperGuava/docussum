import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** middleware가 `/`를 처리하지만, 직접 진입 시 fallback */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  redirect(user && session ? "/dashboard" : "/login");
}
