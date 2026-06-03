import type { StructuredSummary, SummaryDetail, SummaryListItem } from "@/types/summary";
import { DEFAULT_SUMMARY_OPTIONS } from "@/types/summary";

const MOCK_STRUCTURED: StructuredSummary = {
  schemaVersion: "v2",
  title: "Next.js 16 App Router 핵심 정리",
  insight:
    "App Router는 서버 컴포넌트와 파일 기반 라우팅을 중심으로, 레이아웃·데이터 페칭·API를 한 프로젝트 안에서 일관되게 구성할 수 있게 합니다.",
  tldr: [
    "App Router는 서버 우선 아키텍처",
    "layout.tsx로 공통 UI 재사용",
    "API Route로 백엔드 통합",
  ],
  tableOfContents: [
    { id: "1", title: "개요", level: 1 },
    { id: "2", title: "주요 포인트", level: 1 },
  ],
  sections: [
    {
      id: "1",
      heading: "1. 개요",
      level: 2,
      content:
        "App Router는 **파일 기반 라우팅**과 **서버 컴포넌트**를 중심으로 동작합니다.",
    },
    {
      id: "2",
      heading: "2. 주요 포인트",
      level: 2,
      content:
        "- 레이아웃 중첩\n- Server Actions\n- 스트리밍 UI",
    },
  ],
};

const now = Date.now();

export const MOCK_HISTORY: SummaryListItem[] = [
  {
    id: "mock-1",
    title: "Next.js 16 App Router 핵심 정리",
    sourceType: "text",
    status: "completed",
    createdAt: new Date(now).toISOString(),
  },
  {
    id: "mock-2",
    title: "AI 요약 SaaS 제품 전략",
    sourceType: "youtube",
    status: "completed",
    createdAt: new Date(now - 86_400_000).toISOString(),
  },
  {
    id: "mock-3",
    title: "Gemini Video Understanding 소개",
    sourceType: "youtube",
    status: "completed",
    createdAt: new Date(now - 172_800_000).toISOString(),
  },
];

export const MOCK_DETAILS: Record<string, SummaryDetail> = {
  "mock-1": {
    id: "mock-1",
    sourceType: "text",
    originalContent: "Mock text content",
    title: "Next.js 16 App Router 핵심 정리",
    summaryText: `## 개요\n\nApp Router는 **파일 기반 라우팅**과 **서버 컴포넌트**를 중심으로 동작합니다.\n\n## 주요 포인트\n\n- 레이아웃 중첩\n- Server Actions\n- 스트리밍 UI`,
    status: "completed",
    metadata: {
      tldr: [
        "App Router는 서버 우선 아키텍처",
        "layout.tsx로 공통 UI 재사용",
        "API Route로 백엔드 통합",
      ],
    },
    errorMessage: null,
    createdAt: new Date(now).toISOString(),
    schemaVersion: "v2",
    structured: MOCK_STRUCTURED,
    summaryOptions: DEFAULT_SUMMARY_OPTIONS,
  },
  "mock-2": {
    id: "mock-2",
    sourceType: "youtube",
    originalContent: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "AI 요약 SaaS 제품 전략",
    summaryText: `## 영상 요약\n\nPay-as-you-go 크레딧 모델과 **비동기 요약**이 핵심입니다.`,
    status: "completed",
    metadata: {
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      videoTitle: "AI 요약 SaaS 제품 전략 (Mock)",
      tldr: [
        "크레딧 기반 과금",
        "이메일 완료 알림",
        "Gemini URL 직접 요약",
      ],
    },
    errorMessage: null,
    createdAt: new Date(now - 86_400_000).toISOString(),
    schemaVersion: "v1",
    structured: null,
    summaryOptions: DEFAULT_SUMMARY_OPTIONS,
  },
  "mock-3": {
    id: "mock-3",
    sourceType: "youtube",
    originalContent: "https://www.youtube.com/watch?v=example",
    title: "Gemini Video Understanding 소개",
    summaryText: `## 요약\n\nYouTube URL을 **Gemini에 직접 전달**하여 요약합니다. 자막 추출 파이프라인은 사용하지 않습니다.`,
    status: "completed",
    metadata: {
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      videoTitle: "Gemini Video Understanding (Mock)",
      tldr: [
        "URL 직접 입력",
        "oEmbed으로 UI 메타만 조회",
        "단일 API 호출",
      ],
    },
    errorMessage: null,
    createdAt: new Date(now - 172_800_000).toISOString(),
    schemaVersion: "v1",
    structured: null,
    summaryOptions: DEFAULT_SUMMARY_OPTIONS,
  },
};
