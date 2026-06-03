import type { SummaryCompleteEmailProps } from "./summary-complete";

/** React Email 미리보기(`pnpm email:dev`)용 샘플 */
export const SUMMARY_COMPLETE_PREVIEW: SummaryCompleteEmailProps = {
  title: "React 19와 Next.js 16 — App Router 핵심 정리",
  tldr: [
    "Server Components가 기본이며, 상호작용 UI만 'use client'로 분리합니다.",
    "서버에서 await한 데이터를 스트리밍해 로딩·완료 UI를 단계적으로 보여줄 수 있습니다.",
    "fetch 캐시·cacheTag·revalidate로 갱신을 제어하고, Vercel 배포에 맞춰 최적화합니다.",
  ],
  dashboardUrl:
    "http://localhost:3002/dashboard?summary=00000000-0000-4000-8000-000000000099",
};
