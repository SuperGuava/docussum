const VIDEO_ID_RE = /^[\w-]{11}$/;

/** URL 주변 짧은 안내 문구(예: "이거 요약해줘") 허용 길이 */
const INCIDENTAL_TEXT_MAX = 48;

const YOUTUBE_URL_IN_TEXT_RE =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/\S*|youtu\.be\/\S*)|(?:www\.)?youtube\.com\/\S*|youtu\.be\/\S*/gi;

export function normalizeYouTubeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/** Gemini fileUri용 표준 watch URL (추적 파라미터 ?si= 등 제거) */
export function extractYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = normalizeYouTubeUrl(trimmed);
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && VIDEO_ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v && VIDEO_ID_RE.test(v)) return v;

      const pathMatch = parsed.pathname.match(
        /\/(?:embed|shorts|live)\/([\w-]{11})/,
      );
      if (pathMatch?.[1]) return pathMatch[1];
    }
  } catch {
    /* fall through to regex */
  }

  const patterns = [
    /youtu\.be\/([\w-]{11})/i,
    /[?&]v=([\w-]{11})/i,
    /\/(?:embed|shorts|live)\/([\w-]{11})/i,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function toCanonicalYouTubeWatchUrl(url: string): string {
  const id = extractYouTubeVideoId(url);
  if (!id) return normalizeYouTubeUrl(url);
  return `https://www.youtube.com/watch?v=${id}`;
}

/** 문자열에서 첫 번째 YouTube watch URL 추출 */
export function extractFirstYouTubeWatchUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const candidates: string[] = [];
  for (const match of trimmed.matchAll(YOUTUBE_URL_IN_TEXT_RE)) {
    candidates.push(match[0]);
  }

  for (const token of trimmed.split(/\s+/)) {
    if (token.includes("youtube") || token.includes("youtu.be")) {
      candidates.push(token.replace(/[),.;!?]+$/, ""));
    }
  }

  if (extractYouTubeVideoId(trimmed)) {
    candidates.unshift(trimmed);
  }

  for (const candidate of candidates) {
    const id = extractYouTubeVideoId(candidate);
    if (id) return toCanonicalYouTubeWatchUrl(candidate);
  }

  return null;
}

/** 입력에서 YouTube URL 부분 제거 후 남은 텍스트 */
export function stripYouTubeUrls(text: string): string {
  return text
    .replace(YOUTUBE_URL_IN_TEXT_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** URL 외 짧은 안내 문구만 있는지 (영상 요약으로 보낼지 판단) */
export function isIncidentalTextAroundUrl(remainder: string): boolean {
  const r = remainder.replace(/\s+/g, " ").trim();
  if (!r) return true;
  return r.length <= INCIDENTAL_TEXT_MAX;
}

/**
 * 입력이 YouTube URL(± 짧은 안내 문구)인지.
 * 긴 본문 안에 URL이 끼어 있으면 false → 텍스트 요약 유지.
 */
export function isValidYouTubeUrl(input: string): boolean {
  const extracted = extractFirstYouTubeWatchUrl(input);
  if (!extracted) return false;

  const lines = input
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.every((line) => extractFirstYouTubeWatchUrl(line) !== null);
  }

  return isIncidentalTextAroundUrl(stripYouTubeUrls(input));
}

/** 텍스트 탭에 URL만 붙여넣은 경우 (YouTube 파이프라인으로 보내야 함) */
export function isYouTubeOnlyInput(content: string): boolean {
  const lines = content
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length === 1 && isValidYouTubeUrl(lines[0]);
}

/** 텍스트 탭 입력을 YouTube 영상 요약으로 전환할지 */
export function shouldCoerceTextInputToYouTube(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  if (isYouTubeOnlyInput(trimmed)) return true;

  const firstUrl = extractFirstYouTubeWatchUrl(trimmed);
  if (!firstUrl) return false;

  return isIncidentalTextAroundUrl(stripYouTubeUrls(trimmed));
}
