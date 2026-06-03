"use client";

import type { SummaryLength, SummaryOptions, SummaryTone } from "@/types/summary";
import { cn } from "@/lib/utils";

type SummaryOptionsBarProps = {
  value: SummaryOptions;
  onChange: (value: SummaryOptions) => void;
  disabled?: boolean;
};

function SegmentGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              value === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const LENGTH_OPTIONS: { value: SummaryLength; label: string }[] = [
  { value: "short", label: "짧게" },
  { value: "default", label: "기본" },
  { value: "long", label: "길게" },
];

const TONE_OPTIONS: { value: SummaryTone; label: string }[] = [
  { value: "default", label: "기본" },
  { value: "easy", label: "쉽게" },
];

export function SummaryOptionsBar({
  value,
  onChange,
  disabled,
}: SummaryOptionsBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SegmentGroup
        label="요약 길이"
        options={LENGTH_OPTIONS}
        value={value.length}
        onChange={(length) => onChange({ ...value, length })}
        disabled={disabled}
      />
      <SegmentGroup
        label="문체"
        options={TONE_OPTIONS}
        value={value.tone}
        onChange={(tone) => onChange({ ...value, tone })}
        disabled={disabled}
      />
    </div>
  );
}
