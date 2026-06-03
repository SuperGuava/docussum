import type { StructuredSummary } from "@/types/summary";

export function structuredSummaryToMarkdown(
  summary: StructuredSummary,
): string {
  const lines: string[] = [
    `# ${summary.title}`,
    "",
    "## 핵심 인사이트",
    "",
    summary.insight,
    "",
    "## TL;DR",
    "",
    ...summary.tldr.filter(Boolean).map((line) => `- ${line}`),
    "",
    "## 목차",
    "",
    ...summary.tableOfContents.map(
      (item) => `${"  ".repeat(Math.max(0, item.level - 1))}- ${item.title}`,
    ),
    "",
  ];

  for (const section of summary.sections) {
    lines.push(`## ${section.heading}`, "", section.content, "");
    if (section.citations?.length) {
      lines.push(
        ...section.citations.map((c) => `- [${c.label}](${c.url})`),
        "",
      );
    }
  }

  return lines.join("\n").trim();
}

export function downloadMarkdownFile(
  filename: string,
  content: string,
): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
