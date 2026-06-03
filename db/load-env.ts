import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

/**
 * Next.js는 .env.local을 자동 로드하지만, drizzle-kit CLI는 별도 프로세스이므로
 * drizzle.config.ts에서 이 헬퍼로 동일한 우선순위를 맞춘다.
 *
 * 우선순위(낮음 → 높음): .env → .env.local
 */
export function loadEnvFiles(cwd = process.cwd()) {
  const envPath = resolve(cwd, ".env");
  const envLocalPath = resolve(cwd, ".env.local");

  if (existsSync(envPath)) {
    config({ path: envPath });
  }

  if (existsSync(envLocalPath)) {
    config({ path: envLocalPath, override: true });
  }
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      [
        "DATABASE_URL이 설정되지 않았습니다.",
        "프로젝트 루트에 .env.local 파일을 만들고 DATABASE_URL을 추가하세요.",
        "예시는 .env.example을 참고하세요.",
      ].join("\n"),
    );
  }

  return url;
}
