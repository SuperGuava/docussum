import { Sparkles } from "lucide-react";

type SummaryInsightHeroProps = {
  insight: string;
};

export function SummaryInsightHero({ insight }: SummaryInsightHeroProps) {
  if (!insight.trim()) return null;

  return (
    <section className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="size-4" />
        핵심 인사이트
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{insight}</p>
    </section>
  );
}
