type GoogleRpcError = {
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
};

/** API/ SDK 오류에서 사용자에게 보여줄 핵심 메시지 추출 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const fromJson = parseGoogleErrorJson(error.message);
    if (fromJson) return fromJson;
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string") {
      const fromJson = parseGoogleErrorJson(record.message);
      if (fromJson) return fromJson;
      return record.message;
    }
  }

  return String(error);
}

function parseGoogleErrorJson(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  try {
    const parsed = JSON.parse(raw.slice(start)) as GoogleRpcError;
    return parsed.error?.message ?? null;
  } catch {
    return null;
  }
}

/** 'context' 단어가 들어간 무관한 JSON 오류를 길이 제한으로 오인하지 않도록 엄격히 판별 */
export function isTokenOrLengthLimitError(message: string): boolean {
  const lower = message.toLowerCase();

  const patterns = [
    /context (window|length|limit)/i,
    /context.*(exceed|overflow|too (large|long))/i,
    /exceed(s|ed)?\s+(the\s+)?(max|maximum).*(token|context|length|input)/i,
    /token limit/i,
    /too many tokens/i,
    /input (is )?too long/i,
    /payload too large/i,
    /resource_exhausted/i,
    /maximum number of tokens/i,
    /decrease the input/i,
  ];

  return patterns.some((pattern) => pattern.test(lower));
}

export function isYouTubeAccessError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("private") ||
    lower.includes("unavailable") ||
    lower.includes("not found") ||
    lower.includes("video") && lower.includes("access")
  );
}

export function isApiKeyError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("api key not valid") ||
    lower.includes("api_key_invalid") ||
    lower.includes("invalid api key")
  );
}
