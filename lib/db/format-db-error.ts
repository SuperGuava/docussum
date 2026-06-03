/** Drizzle/postgres-js 오류에서 사용자에게 보여줄 메시지 추출 */
export function formatDbError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause;
    if (cause instanceof Error && cause.message) {
      return `${error.message}: ${cause.message}`;
    }
    return error.message;
  }
  return "데이터베이스 작업에 실패했습니다.";
}

/** 스키마 미반영(컬럼 없음) 여부 힌트 */
export function isLikelySchemaMismatch(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("summary_options") ||
    lower.includes("schema_version") ||
    lower.includes("does not exist") ||
    lower.includes("column") ||
    lower.includes("failed query") ||
    lower.includes("foreign key") ||
    lower.includes("violates")
  );
}

export function dbErrorHint(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("summary_options") ||
    lower.includes("schema_version") ||
    (lower.includes("column") && lower.includes("does not exist"))
  ) {
    return " `pnpm db:push` 또는 Supabase SQL Editor에서 `db/migrations/001_epic6_summary_columns.sql`을 실행하세요.";
  }
  if (lower.includes("foreign key") || lower.includes("violates")) {
    return " `user_id`가 `users` 테이블을 참조하는 경우, `db/migrations/002_dev_user_seed.sql`을 실행하거나 FK를 제거하세요.";
  }
  if (lower.includes("failed query")) {
    return " Supabase SQL Editor에서 위 마이그레이션을 적용한 뒤 Table Editor로 `summaries` 컬럼을 확인하세요.";
  }
  return "";
}
