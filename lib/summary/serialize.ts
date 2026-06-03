import type { Summary } from "@/db/schema";
import { parseStoredSummary } from "@/lib/gemini/parse-structured";
import type {
  SummaryDetail,
  SummaryMetadata,
  SummaryOptions,
} from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

function parseRowMetadata(raw: string | null): SummaryMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SummaryMetadata;
  } catch {
    return null;
  }
}

function parseRowOptions(raw: unknown): SummaryOptions | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as SummaryOptions;
  if (o.length && o.tone) return o;
  return null;
}

export function toSummaryDetail(row: Summary): SummaryDetail {
  const rowMetadata = parseRowMetadata(row.metadata);
  const structured = parseStoredSummary(
    row.summaryText,
    row.schemaVersion,
    rowMetadata,
  );

  let metadata: SummaryMetadata | null = rowMetadata;
  if (structured?.metadata) {
    metadata = { ...metadata, ...structured.metadata };
  }
  if (structured?.tldr) {
    metadata = { ...metadata, tldr: [...structured.tldr] };
  }

  const legacyBody =
    structured?.sections.map((s) => s.content).join("\n\n") ??
    row.summaryText;

  return {
    id: row.id,
    sourceType: row.sourceType,
    originalContent: row.originalContent,
    title: row.title ?? structured?.title ?? null,
    summaryText: legacyBody,
    status: row.status,
    metadata,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    schemaVersion:
      row.schemaVersion === "v1" || row.schemaVersion === "v2"
        ? row.schemaVersion
        : structured
          ? "v2"
          : "v1",
    structured,
    summaryOptions: parseRowOptions(row.summaryOptions) ?? DEFAULT_SUMMARY_OPTIONS,
  };
}
