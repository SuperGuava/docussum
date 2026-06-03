function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** 요약 제목이 YouTube oEmbed 제목과 현저히 다르면 true (환각·오탭 의심) */
export function titlesLikelyMismatch(
  videoTitle: string | undefined,
  summaryTitle: string | undefined,
): boolean {
  if (!videoTitle?.trim() || !summaryTitle?.trim()) return false;
  if (summaryTitle.includes("VIDEO_ACCESS_ERROR")) return true;

  const a = normalizeTitle(videoTitle);
  const b = normalizeTitle(summaryTitle);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return false;

  const tokens = videoTitle
    .split(/[\s|[\]|【】\-–—,:;!?]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return false;

  const hits = tokens.filter((t) =>
    summaryTitle.toLowerCase().includes(t.toLowerCase()),
  );
  return hits.length / tokens.length < 0.2;
}
