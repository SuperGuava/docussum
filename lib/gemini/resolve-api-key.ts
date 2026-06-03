const PLACEHOLDER_KEYS = new Set([
  "your_gemini_api_key",
  "your-api-key",
  "changeme",
]);

export function resolveGeminiApiKey(): string {
  const raw =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (!raw) {
    throw new Error(
      [
        "GEMINI_API_KEY가 설정되지 않았습니다.",
        ".env.local에 Google AI Studio API 키를 추가하세요.",
        "https://aistudio.google.com/apikey",
      ].join(" "),
    );
  }

  if (PLACEHOLDER_KEYS.has(raw.toLowerCase())) {
    throw new Error(
      "GEMINI_API_KEY가 예시 값입니다. AI Studio에서 발급한 실제 키로 교체하세요.",
    );
  }

  // 따옴표로 감싼 경우 (.env 실수)
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim();
  }

  return raw;
}
