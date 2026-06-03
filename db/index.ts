import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

function createDb() {
  if (!connectionString) {
    return null;
  }
  const client = postgres(connectionString, { prepare: false, max: 1 });
  return drizzle(client, { schema });
}

export const db = createDb();

export function requireDb() {
  if (!db) {
    throw new Error(
      "DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.",
    );
  }
  return db;
}
