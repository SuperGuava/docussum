import type { SummaryOptions, SourceType } from "@/types/summary";

const LENGTH_GUIDE: Record<SummaryOptions["length"], string> = {
  short: "Keep 2-3 main sections only. TL;DR and insight must be very concise.",
  default: "Use 4-6 main sections with clear hierarchy.",
  long: "Use 6-10 sections with richer detail in each section.",
};

const TONE_GUIDE: Record<SummaryOptions["tone"], string> = {
  default: "Use clear professional Korean (or match source language if English-only).",
  easy:
    "Explain in simple everyday Korean (쉬운 말) suitable for beginners. Avoid jargon.",
};

export function buildSummaryV2Instruction(
  sourceType: SourceType,
  options: SummaryOptions,
  params?: { youtubeUrl?: string; videoTitle?: string },
): string {
  const youtubeUrl = params?.youtubeUrl;
  const videoTitle = params?.videoTitle?.trim();

  const citationRule =
    sourceType === "youtube" && youtubeUrl
      ? `For each section include citations when possible: [{"label":"출처 보기","url":"${youtubeUrl}?t=SECONDS"}] with best-estimate start seconds.`
      : "citations may be empty arrays.";

  const youtubeAccessRule =
    sourceType === "youtube"
      ? `
YOUTUBE (CRITICAL):
- Summarize ONLY the video at the provided file URI. Watch/listen to that exact upload.
- Official YouTube title: ${videoTitle ? `"${videoTitle}"` : "(fetch from the video itself)"}
- Your JSON "title" and all sections MUST match this video's actual spoken/shown content.
- FORBIDDEN: Summaries of other videos, unrelated famous people/companies, or generic articles when they are not in this video.
- If you cannot access the video content, set "title" to "VIDEO_ACCESS_ERROR" and "insight" to a short explanation in Korean.`
      : "";

  return `You are DocuSumm, an expert summarizer (LilysAI-style structured output).
Respond with ONLY valid JSON (no markdown fences).
${youtubeAccessRule}

${LENGTH_GUIDE[options.length]}
${TONE_GUIDE[options.tone]}

Shape:
{
  "title": "short descriptive title",
  "insight": "one paragraph core insight (2-4 sentences)",
  "tldr": ["bullet 1", "bullet 2", "bullet 3"],
  "tableOfContents": [{"id":"1","title":"Section title","level":1}],
  "sections": [
    {
      "id": "1",
      "heading": "1. Section title",
      "level": 2,
      "content": "Markdown body for this section",
      "citations": []
    }
  ]
}

Rules:
- tldr: exactly 3 concise lines.
- tableOfContents mirrors sections (level 1 for main, 2 for sub).
- sections: at least 2 items; content uses Markdown (lists, bold).
- Do not invent facts not in the source.
- ${citationRule}
- No text outside the JSON object.`;
}
