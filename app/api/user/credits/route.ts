import { AuthError } from "@/lib/auth/errors";
import { requireAuthUser } from "@/lib/auth/get-user";
import { getBalance } from "@/lib/credits/ledger";

export async function GET() {
  try {
    const { id: userId } = await requireAuthUser();
    const credits = await getBalance(userId);
    return Response.json({ credits });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "크레딧을 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 503 });
  }
}
