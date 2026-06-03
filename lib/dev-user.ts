export function getDevUserId(): string {
  const id = process.env.DEV_USER_ID;
  if (!id) {
    throw new Error(
      "DEV_USER_ID가 설정되지 않았습니다. .env.local에 UUID를 추가하세요.",
    );
  }
  return id;
}
