import type {
  StructuredSummary,
  SummaryCitation,
  SummaryMetadata,
  SummaryOptions,
  SummaryResultV1,
  SummarySection,
  SummaryTocItem,
} from "@/types/summary";

import { GeminiSummaryError } from "./parse-response";

function normalizeTldr(raw: string[]): [string, string, string] {
  const tldr = raw.filter(Boolean).slice(0, 3);
  while (tldr.length < 3) tldr.push("");
  return [tldr[0] ?? "", tldr[1] ?? "", tldr[2] ?? ""];
}

export function parseStructuredSummaryJson(
  raw: string,
  metadata?: SummaryMetadata,
): StructuredSummary {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new GeminiSummaryError(
      "요약 결과를 파싱하지 못했습니다.",
      "parse",
    );
  }

  let parsed: {
    title?: string;
    insight?: string;
    tldr?: string[];
    tableOfContents?: SummaryTocItem[];
    sections?: SummarySection[];
    body?: string;
  };

  try {
    parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
  } catch {
    throw new GeminiSummaryError(
      "요약 결과 JSON 형식이 올바르지 않습니다.",
      "parse",
    );
  }

  if (!parsed.title) {
    throw new GeminiSummaryError(
      "요약 결과에 제목이 없습니다.",
      "parse",
    );
  }

  if (parsed.title === "VIDEO_ACCESS_ERROR") {
    throw new GeminiSummaryError(
      "Gemini가 이 YouTube 영상 내용을 읽지 못했습니다. 영상이 공개 상태인지 확인한 뒤, YouTube 탭에서 `https://www.youtube.com/watch?v=...` 형식으로 다시 요약해 주세요.",
      "api",
    );
  }

  // v2 full structure
  if (parsed.sections && parsed.sections.length > 0) {
    const sections = parsed.sections.map((s, i) => ({
      id: s.id || String(i + 1),
      heading: s.heading || `섹션 ${i + 1}`,
      level: s.level ?? 2,
      content: s.content || "",
      citations: normalizeCitations(s.citations),
    }));

    const tableOfContents =
      parsed.tableOfContents && parsed.tableOfContents.length > 0
        ? parsed.tableOfContents
        : sections.map((s) => ({
            id: s.id,
            title: s.heading.replace(/^\d+\.\s*/, ""),
            level: s.level,
          }));

    return {
      schemaVersion: "v2",
      title: parsed.title,
      insight: parsed.insight || parsed.tldr?.join(" ") || "",
      tldr: normalizeTldr(parsed.tldr ?? []),
      tableOfContents,
      sections,
      metadata,
    };
  }

  // v1-shaped JSON inside response — upgrade to v2
  if (parsed.body) {
    return v1ToStructured({
      title: parsed.title,
      tldr: parsed.tldr ?? [],
      body: parsed.body,
      metadata,
    });
  }

  throw new GeminiSummaryError(
    "요약 결과에 섹션 본문이 없습니다.",
    "parse",
  );
}

function normalizeCitations(
  citations?: SummaryCitation[],
): SummaryCitation[] | undefined {
  if (!citations?.length) return undefined;
  const valid = citations.filter((c) => c.url && c.label);
  return valid.length ? valid : undefined;
}

export function v1ToStructured(v1: SummaryResultV1): StructuredSummary {
  return {
    schemaVersion: "v2",
    title: v1.title,
    insight: v1.tldr.filter(Boolean).join(" ") || v1.body.slice(0, 280),
    tldr: normalizeTldr(v1.tldr),
    tableOfContents: [{ id: "1", title: "요약", level: 1 }],
    sections: [
      {
        id: "1",
        heading: "1. 요약",
        level: 2,
        content: v1.body,
      },
    ],
    metadata: v1.metadata,
  };
}

export function parseStoredSummary(
  summaryText: string | null,
  schemaVersion: string | null,
  rowMetadata: SummaryMetadata | null,
): StructuredSummary | null {
  if (!summaryText) return null;

  try {
    const parsed = JSON.parse(summaryText) as
      | StructuredSummary
      | SummaryResultV1
      | { schemaVersion?: string };

    if (
      "schemaVersion" in parsed &&
      parsed.schemaVersion === "v2" &&
      "sections" in parsed &&
      Array.isArray(parsed.sections)
    ) {
      return parsed as StructuredSummary;
    }

    if ("sections" in parsed && Array.isArray(parsed.sections)) {
      return { ...(parsed as StructuredSummary), schemaVersion: "v2" };
    }

    if ("body" in parsed && parsed.body) {
      return v1ToStructured({
        title: parsed.title as string,
        tldr: (parsed.tldr as string[]) ?? [],
        body: parsed.body as string,
        metadata: rowMetadata ?? undefined,
      });
    }
  } catch {
    if (schemaVersion === "v1" || !schemaVersion) {
      return v1ToStructured({
        title: "요약",
        tldr: ["", "", ""],
        body: summaryText,
        metadata: rowMetadata ?? undefined,
      });
    }
  }

  return null;
}

export function structuredSummaryToStorage(
  summary: StructuredSummary,
): string {
  return JSON.stringify(summary);
}
