export type SourceType = "text" | "youtube";
export type SummaryStatus = "pending" | "completed" | "failed";
export type SummaryLength = "short" | "default" | "long";
export type SummaryTone = "default" | "easy";
export type SchemaVersion = "v1" | "v2";

export type SummaryOptions = {
  length: SummaryLength;
  tone: SummaryTone;
};

export const DEFAULT_SUMMARY_OPTIONS: SummaryOptions = {
  length: "default",
  tone: "default",
};

export type SummaryCitation = {
  label: string;
  url: string;
};

export type SummaryTocItem = {
  id: string;
  title: string;
  level: number;
};

export type SummarySection = {
  id: string;
  heading: string;
  level: number;
  content: string;
  citations?: SummaryCitation[];
};

export type SummaryMetadata = {
  thumbnailUrl?: string;
  videoTitle?: string;
  tldr?: string[];
};

/** Epic 6 structured output */
export type StructuredSummary = {
  schemaVersion: "v2";
  title: string;
  insight: string;
  tldr: [string, string, string];
  tableOfContents: SummaryTocItem[];
  sections: SummarySection[];
  metadata?: SummaryMetadata;
};

/** Legacy v1 (internal / fallback) */
export type SummaryResultV1 = {
  title: string;
  tldr: string[];
  body: string;
  metadata?: SummaryMetadata;
};

export type SummaryListItem = {
  id: string;
  title: string | null;
  sourceType: SourceType;
  status: SummaryStatus;
  createdAt: string;
  summaryOptions?: SummaryOptions | null;
};

export type SummaryDetail = {
  id: string;
  sourceType: SourceType;
  originalContent: string;
  title: string | null;
  summaryText: string | null;
  status: SummaryStatus;
  metadata: SummaryMetadata | null;
  errorMessage: string | null;
  createdAt: string;
  schemaVersion: SchemaVersion;
  structured: StructuredSummary | null;
  summaryOptions: SummaryOptions | null;
};
