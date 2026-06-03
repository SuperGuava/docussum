"use client";

import type { SummaryTocItem } from "@/types/summary";
import { cn } from "@/lib/utils";

type SummaryTocProps = {
  items: SummaryTocItem[];
  onNavigate: (sectionId: string) => void;
};

export function SummaryToc({ items, onNavigate }: SummaryTocProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="목차"
      className="rounded-lg border bg-muted/40 p-3"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        목차
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-background",
                item.level > 1 && "pl-4 text-muted-foreground",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
