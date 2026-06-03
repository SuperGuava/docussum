"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resolveSummaryInput } from "@/lib/youtube/resolve-input";
import {
  extractFirstYouTubeWatchUrl,
  isValidYouTubeUrl,
  shouldCoerceTextInputToYouTube,
} from "@/lib/youtube/validate";
import type { SourceType, SummaryOptions } from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";
import { cn } from "@/lib/utils";

import { SummaryOptionsBar } from "./summary-options-bar";

type InputPanelProps = {
  onSubmit: (
    sourceType: SourceType,
    content: string,
    options: SummaryOptions,
  ) => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
};

type Tab = SourceType;

export function InputPanel({
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: InputPanelProps) {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [options, setOptions] = useState<SummaryOptions>(DEFAULT_SUMMARY_OPTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  const urlValid =
    youtubeUrl.trim().length === 0 || isValidYouTubeUrl(youtubeUrl);
  const urlError =
    urlTouched && youtubeUrl.trim().length > 0 && !isValidYouTubeUrl(youtubeUrl);

  const canSubmit =
    !disabled &&
    !isSubmitting &&
    (tab === "text"
      ? text.trim().length > 0
      : youtubeUrl.trim().length > 0 && isValidYouTubeUrl(youtubeUrl));

  const textLooksLikeYoutube =
    tab === "text" &&
    text.trim().length > 0 &&
    shouldCoerceTextInputToYouTube(text);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (tab === "text") {
        const resolved = resolveSummaryInput("text", text.trim());
        if (resolved.coercedFromText) {
          toast.message("YouTube 영상으로 요약합니다", {
            description:
              "URL만 입력된 경우 영상 이해 API를 사용합니다. 'YouTube' 탭을 써도 됩니다.",
          });
        }
        await onSubmit(resolved.sourceType, resolved.content, options);
      } else {
        const resolved = resolveSummaryInput("youtube", youtubeUrl.trim());
        await onSubmit(resolved.sourceType, resolved.content, options);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "요약 요청에 실패했습니다.",
      );
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {(
          [
            ["text", "텍스트"],
            ["youtube", "YouTube"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "text" ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            placeholder="요약할 텍스트를 붙여넣으세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSubmitting}
            className="min-h-[140px]"
          />
          <p className="text-right text-xs text-muted-foreground">
            {text.length.toLocaleString()}자
          </p>
          {textLooksLikeYoutube && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
              YouTube URL이 감지되었습니다. 요약하기를 누르면{" "}
              <strong>영상 내용</strong>을 기준으로 요약합니다. 긴 글+URL을
              함께 넣으면 오류가 날 수 있으니, 영상만 요약할 때는{" "}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  const url = extractFirstYouTubeWatchUrl(text) ?? text.trim();
                  setTab("youtube");
                  setYoutubeUrl(url);
                  setText("");
                }}
              >
                YouTube 탭
              </button>
              을 권장합니다.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => {
              setYoutubeUrl(e.target.value);
              setUrlTouched(true);
            }}
            onBlur={() => setUrlTouched(true)}
            disabled={disabled || isSubmitting}
            aria-invalid={urlError}
          />
          {urlError && (
            <p className="text-sm text-destructive">
              youtube.com 또는 youtu.be 형식의 URL을 입력해 주세요.
            </p>
          )}
          {urlTouched && urlValid && youtubeUrl.trim() && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              유효한 YouTube URL입니다.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <SummaryOptionsBar
          value={options}
          onChange={setOptions}
          disabled={disabled || isSubmitting}
        />
      </div>

      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={!canSubmit}
        onClick={() => void handleSubmit()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            요약 중...
          </>
        ) : (
          "요약하기"
        )}
      </Button>
    </div>
  );
}
