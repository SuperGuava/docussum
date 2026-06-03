import type {
  StructuredSummary,
  SummaryOptions,
  SourceType,
} from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

import { GEMINI_MODEL, getGenAIClient, TEXT_INPUT_MAX_CHARS } from "./client";
import { buildSummaryV2Instruction } from "./prompts-v2";
import {
  getResponseText,
  GeminiSummaryError,
  mapGeminiError,
} from "./parse-response";
import { parseStructuredSummaryJson } from "./parse-structured";
import { fetchYouTubeOEmbed } from "@/lib/youtube/oembed";
import { resolveSummaryInput } from "@/lib/youtube/resolve-input";
import {
  extractFirstYouTubeWatchUrl,
  isIncidentalTextAroundUrl,
  stripYouTubeUrls,
} from "@/lib/youtube/validate";

export async function summarizeContent(
  sourceType: SourceType,
  content: string,
  options: SummaryOptions = DEFAULT_SUMMARY_OPTIONS,
): Promise<StructuredSummary> {
  const resolved = resolveSummaryInput(sourceType, content);
  sourceType = resolved.sourceType;
  content = resolved.content;

  if (sourceType === "text" && extractFirstYouTubeWatchUrl(content)) {
    const remainder = stripYouTubeUrls(content);
    if (!isIncidentalTextAroundUrl(remainder)) {
      throw new GeminiSummaryError(
        "입력에 YouTube URL과 긴 본문이 함께 있습니다. 영상만 요약하려면 'YouTube' 탭에 URL을 넣거나, 글 전체를 요약하려면 URL을 빼 주세요.",
        "api",
      );
    }
  }

  if (sourceType === "text" && content.length > TEXT_INPUT_MAX_CHARS) {
    throw new GeminiSummaryError(
      `텍스트가 너무 깁니다 (최대 ${TEXT_INPUT_MAX_CHARS.toLocaleString()}자). 내용을 나누어 요약해 주세요.`,
      "token",
    );
  }

  const ai = getGenAIClient();
  let metadata: StructuredSummary["metadata"];

  try {
    if (sourceType === "youtube") {
      const watchUrl = content;
      const oembed = await fetchYouTubeOEmbed(watchUrl);
      metadata = {
        thumbnailUrl: oembed?.thumbnailUrl,
        videoTitle: oembed?.title,
      };

      const instruction = buildSummaryV2Instruction("youtube", options, {
        youtubeUrl: watchUrl,
        videoTitle: oembed?.title,
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            fileData: {
              fileUri: watchUrl,
            },
          },
          {
            text: `${instruction}\n\nSummarize the YouTube video at the file URI above.`,
          },
        ],
      });

      return parseStructuredSummaryJson(
        getResponseText(response.text),
        metadata,
      );
    }

    const instruction = buildSummaryV2Instruction("text", options);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        instruction,
        `Summarize the following text:\n\n${content}`,
      ],
    });

    return parseStructuredSummaryJson(getResponseText(response.text));
  } catch (error) {
    if (error instanceof GeminiSummaryError) throw error;
    throw mapGeminiError(error);
  }
}
