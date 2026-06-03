"use client";

import Image from "next/image";
import { Copy, Share2, FileText, Youtube, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  downloadMarkdownFile,
  structuredSummaryToMarkdown,
} from "@/lib/summary/export-markdown";
import { titlesLikelyMismatch } from "@/lib/youtube/title-alignment";
import type { SummaryDetail, StructuredSummary } from "@/types/summary";

import { SummaryInsightHero } from "./summary-insight-hero";
import { SummarySections } from "./summary-sections";
import { SummaryToc } from "./summary-toc";

type SummaryCardProps = {
  detail: SummaryDetail | null;
  isLoading?: boolean;
  loadingMessage?: string;
};

function SummaryCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function buildCopyText(detail: SummaryDetail, structured: StructuredSummary | null): string {
  if (structured) {
    return structuredSummaryToMarkdown(structured);
  }
  const tldr = detail.metadata?.tldr ?? [];
  return [
    detail.title ?? "",
    "",
    ...(tldr.length ? ["## TL;DR", ...tldr.map((l) => `- ${l}`), ""] : []),
    detail.summaryText ?? "",
  ].join("\n");
}

export function SummaryCard({
  detail,
  isLoading,
  loadingMessage = "요약 중입니다...",
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        <SummaryCardSkeleton />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center">
        <FileText className="mb-3 size-10 text-muted-foreground" />
        <p className="text-lg font-medium">요약 결과가 여기에 표시됩니다</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          텍스트를 입력하거나 YouTube URL을 붙여넣은 뒤 요약하기를 눌러
          보세요.
        </p>
      </div>
    );
  }

  if (detail.status === "failed") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">요약에 실패했습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {detail.errorMessage ?? "알 수 없는 오류가 발생했습니다."}
        </p>
      </div>
    );
  }

  const structured = detail.structured;
  const tldr = structured?.tldr ?? detail.metadata?.tldr ?? [];
  const isYoutube = detail.sourceType === "youtube";
  const meta = structured?.metadata ?? detail.metadata;
  const videoTitle = meta?.videoTitle;
  const summaryTitle = structured?.title ?? detail.title ?? "";
  const titleMismatch =
    isYoutube && titlesLikelyMismatch(videoTitle, summaryTitle);

  const scrollToSection = (sectionId: string) => {
    document
      .getElementById(`section-${sectionId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(detail, structured));
      toast.success("요약 내용이 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const handleDownload = () => {
    if (!structured) {
      toast.error("구조화된 요약만 다운로드할 수 있습니다.");
      return;
    }
    const safeName =
      (detail.title ?? "docusumm-summary").replace(/[^\w가-힣.-]+/g, "_") ||
      "summary";
    downloadMarkdownFile(`${safeName}.md`, structuredSummaryToMarkdown(structured));
    toast.success("Markdown 파일을 다운로드했습니다.");
  };

  const handleShare = async () => {
    const text =
      structured?.insight ||
      tldr.filter(Boolean).join("\n") ||
      (detail.summaryText ?? "").slice(0, 200);
    if (navigator.share) {
      try {
        await navigator.share({
          title: detail.title ?? "DocuSumm 요약",
          text,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    await handleCopy();
  };

  return (
    <article className="rounded-xl border bg-card shadow-sm">
      {isYoutube && meta?.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
          <Image
            src={meta.thumbnailUrl}
            alt={meta.videoTitle ?? "YouTube thumbnail"}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2 text-white">
              <Youtube className="size-4 shrink-0" />
              <p className="line-clamp-2 text-sm font-medium">
                {meta.videoTitle ?? detail.title}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 p-6">
        {titleMismatch && (
          <div
            className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-50"
            role="alert"
          >
            <p className="font-medium">요약이 영상과 맞지 않을 수 있습니다</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
              YouTube 제목: 「{videoTitle}」 — 요약 제목과 다릅니다. 텍스트
              탭에 URL만 넣었거나 이전 요청이 잘못 처리됐을 수 있습니다.{" "}
              <a
                href={detail.originalContent}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                원본 영상
              </a>
              과 대조한 뒤 YouTube 탭에서 다시 요약해 보세요.
            </p>
          </div>
        )}

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              {isYoutube ? (
                <>
                  <Youtube className="size-3.5" /> YouTube
                </>
              ) : (
                <>
                  <FileText className="size-3.5" /> Text
                </>
              )}
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {detail.title ?? "요약 결과"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
              <Copy className="size-3.5" />
              복사
            </Button>
            {structured && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-3.5" />
                MD
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleShare()}
            >
              <Share2 className="size-3.5" />
              공유
            </Button>
          </div>
        </header>

        {structured ? (
          <>
            <SummaryInsightHero insight={structured.insight} />

            {tldr.length > 0 && (
              <section className="rounded-lg bg-primary/5 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  TL;DR
                </h3>
                <ul className="space-y-2">
                  {tldr.map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="font-semibold text-primary">
                        {i + 1}.
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <SummaryToc
              items={structured.tableOfContents}
              onNavigate={scrollToSection}
            />

            <SummarySections sections={structured.sections} />
          </>
        ) : (
          <>
            {tldr.length > 0 && (
              <section className="rounded-lg bg-primary/5 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  TL;DR
                </h3>
                <ul className="space-y-2">
                  {tldr.map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="font-semibold text-primary">{i + 1}.</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="prose prose-neutral max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{detail.summaryText}</p>
            </section>
          </>
        )}
      </div>
    </article>
  );
}
