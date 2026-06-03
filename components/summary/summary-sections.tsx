"use client";

import ReactMarkdown from "react-markdown";
import { ExternalLink } from "lucide-react";

import type { SummarySection } from "@/types/summary";

type SummarySectionsProps = {
  sections: SummarySection[];
};

export function SummarySections({ sections }: SummarySectionsProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section
          key={section.id}
          id={`section-${section.id}`}
          className="scroll-mt-24"
        >
          <h3 className="mb-3 text-lg font-semibold tracking-tight">
            {section.heading}
          </h3>
          <div className="prose prose-neutral max-w-none dark:prose-invert prose-p:leading-relaxed">
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
          {section.citations && section.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {section.citations.map((citation, i) => (
                <a
                  key={`${section.id}-citation-${i}`}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs text-primary hover:bg-muted"
                >
                  <ExternalLink className="size-3" />
                  {citation.label}
                </a>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
