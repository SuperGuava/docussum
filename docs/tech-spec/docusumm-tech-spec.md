# DocuSumm Tech Spec

## 소스 트리 구조 (Source Tree Structure)

```
docusumm/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── webhooks/        # Stripe Webhook
│   │   ├── summary/         # 요약 로직
│   │   └── payment/         # 결제 로직
│   ├── auth/                # 인증 관련 페이지
│   ├── dashboard/           # 메인 애플리케이션 뷰
│   │   ├── components/      # 대시보드 전용 컴포넌트
│   │   └── layout.tsx       # 대시보드 레이아웃 (사이드바)
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 랜딩/리다이렉트
├── components/              # 공용 UI 컴포넌트
│   ├── ui/                  # Shadcn UI (Atomic)
│   ├── summary/             # 요약 관련 컴포넌트
│   └── payment/             # 결제 관련 컴포넌트
├── db/                      # Drizzle ORM 및 스키마 정의
├── lib/                     # 비즈니스 로직 및 통합
│   ├── supabase/            # Supabase Client (Auth용)
│   ├── gemini/              # AI 로직
│   ├── stripe/              # 결제 로직
│   └── resend/              # 이메일 로직
├── hooks/                   # 커스텀 훅
├── types/                   # TypeScript 정의
├── utils/                   # 헬퍼 함수
├── middleware.ts            # 인증 미들웨어
├── drizzle/                 # Drizzle 마이그레이션 파일
├── drizzle.config.ts        # Drizzle 설정 파일
└── public/                  # 정적 파일
```

## 기술적 접근 (Technical Approach)

### 1. 아키텍처 개요

-   **프론트엔드**: Next.js 16 기반 App Router 사용. `src` 폴더 없이 루트 레벨 구조 채택.
-   **백엔드**: 별도 서버 없이 Next.js API Routes (Serverless Functions) 활용.
-   **데이터베이스**: Supabase (PostgreSQL)를 사용하여 관계형 데이터 관리.
-   **ORM**: Drizzle ORM을 사용하여 타입 안전한(Type-safe) 쿼리 및 스키마 관리.
-   **AI 엔진**: Google Gemini API를 활용한 요약 기능 구현.
-   **결제 시스템**: Stripe Checkout 및 Webhook을 통한 크레딧 시스템 구현.

### 2. 데이터 흐름 (Data Flow)

1. **사용자 상호작용**: 대시보드에서 텍스트/URL 입력.
2. **데이터 처리**: API Route가 Gemini 호출 -> 결과 및 로그를 Supabase에 저장.
3. **크레딧 시스템**: Stripe Webhook이 결제 완료 이벤트를 수신하여 Supabase의 `credits` 컬럼 업데이트.
4. **알림**: 작업 완료 시 Resend를 통해 이메일 발송.

## 구현 스택 (Implementation Stack)

-   **프레임워크**: Next.js 16+ (App Router)
-   **언어**: TypeScript
-   **스타일링**: Tailwind CSS, Shadcn UI
-   **인증**: Supabase Auth
-   **데이터베이스**: Supabase (PostgreSQL)
-   **ORM**: Drizzle ORM
-   **AI SDK**: `@google/genai` (Google Gen AI SDK for JavaScript/TypeScript)
-   **AI 모델**: Google Gemini 2.5 Flash (`gemini-2.5-flash` 기본, `GEMINI_MODEL` env)
-   **레거시 미사용**: `@google/generative-ai`
-   **결제**: Stripe
-   **이메일**: Resend

## LilysAI 벤치마크 및 Phase 2~3 기술 방향

[LilysAI](https://lilys.ai/ko/) 대비 DocuSumm의 **Phase 2(Epic 6)** 는 요약 **데이터 모델·프롬프트·UI**를 구조화한다. Phase 3(Epic 7)은 **자료 기반 채팅**이다.

### 요약 출력 v2 (`StructuredSummary`)

Epic 2 v1 (`title`, `tldr`, `body`) → Epic 6 v2:

```typescript
// types/summary.ts (계획)
type SummaryLength = "short" | "default" | "long";
type SummaryTone = "default" | "easy";

type SummaryOptions = {
  length: SummaryLength;
  tone: SummaryTone;
};

type SummaryCitation = {
  label: string; // e.g. "출처 보기"
  url: string;   // YouTube: ...?t=120
};

type SummarySection = {
  id: string;
  heading: string;
  level: 1 | 2 | 3;
  content: string; // Markdown
  citations?: SummaryCitation[];
};

type StructuredSummary = {
  title: string;
  insight: string;
  tldr: [string, string, string];
  tableOfContents: { id: string; title: string; level: number }[];
  sections: SummarySection[];
  metadata?: { thumbnailUrl?: string; videoTitle?: string };
};
```

### DB 스키마 확장 (Epic 6)

```sql
alter table public.summaries
  add column if not exists summary_options jsonb,
  add column if not exists schema_version text default 'v1';
-- summary_text: StructuredSummary JSON (v2) 또는 legacy v1
```

### API 확장

```typescript
// POST /api/summary
{
  sourceType: "text" | "youtube",
  content: string,
  options?: { length: "short" | "default" | "long", tone: "default" | "easy" }
}
```

### 프롬프트 전략 (Epic 6)

- `lib/gemini/prompts-v2.ts`: JSON 스키마 + `length`/`tone` 지시문 분기
- YouTube: `fileData.fileUri` 유지 + citations에 `?t=` URL 생성 지시
- **환각 방지**: "원문에 없는 내용 금지", "모르면 빈 citations"

### UI 컴포넌트 (Epic 6)

```
components/summary/
  summary-insight-hero.tsx
  summary-toc.tsx
  summary-sections.tsx
  summary-options-bar.tsx
  export-summary-markdown.ts
```

### Phase 3 채팅 (Epic 7 — 계획)

```
app/api/summary/[id]/chat/route.ts   # streaming
db/schema: summary_messages
components/summary/chat-panel.tsx
```

- 컨텍스트: `StructuredSummary` + `original_content` (토큰 상한 내 truncate)
- SDK: `@google/genai` `generateContentStream`

## 기술 상세 (Technical Details)

### 1. 데이터베이스 스키마 (Database Schema)

**Note**: 스키마 관리는 Drizzle ORM을 사용하여 TypeScript로 정의 및 마이그레이션합니다.

```typescript
// Drizzle Schema Example (db/schema.ts)
// users, summaries, credit_transactions 테이블 정의
```

```sql
-- Reference SQL (Drizzle Kit push로 생성됨)
-- users: 사용자 정보 테이블
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  credits int default 3, -- 가입 보너스
  created_at timestamptz default now()
);

-- summaries: 요약 데이터 테이블
create table public.summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users not null,
  source_type text check (source_type in ('text', 'youtube')),
  original_content text,
  summary_text text,
  status text check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- credit_transactions: 크레딧 변동 내역 테이블
create table public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users not null,
  amount int not null, -- 충전은 양수, 사용은 음수
  type text, -- 'bonus', 'charge', 'usage'
  created_at timestamptz default now()
);
```

### 2. 핵심 로직 (Core Logic - Gemini)

**레퍼런스**

- [@google/genai (npm)](https://www.npmjs.com/package/@google/genai)
- [동영상 이해 (Video understanding)](https://ai.google.dev/gemini-api/docs/video-understanding?hl=ko) — Pass YouTube URLs

#### 2.1 SDK 설치 및 초기화

```bash
npm install @google/genai
```

```typescript
// lib/gemini/client.ts
import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  return new GoogleGenAI({ apiKey });
}
```

- API 키는 **서버(API Route)에서만** 사용. 클라이언트 번들에 포함 금지.
- Node.js 20+ 권장 ([SDK Prerequisites](https://www.npmjs.com/package/@google/genai)).

#### 2.2 텍스트 요약 (`generateContent`)

```typescript
const ai = getGenAIClient();

const response = await ai.models.generateContent({
  model: GEMINI_MODEL,
  contents: [SUMMARY_JSON_INSTRUCTION, `Summarize:\n\n${text}`],
});

const raw = response.text; // JSON 파싱 → { title, tldr, body }
```

- 프롬프트로 TL;DR 3줄 + Markdown 본문을 JSON으로 반환하도록 유도.
- 토큰/컨텍스트 초과 시 사용자 친화적 에러 메시지 매핑.

#### 2.3 YouTube 요약 (`fileData.fileUri` — 단순 API 방식)

공식 문서의 **YouTube URL을 요청에 직접 전달** 패턴을 따른다. File API로 영상을 업로드하거나, 자막/STT로 텍스트를 뽑지 않는다.

```typescript
const ai = getGenAIClient();
const youtubeUrl = "https://www.youtube.com/watch?v=VIDEO_ID"; // 정규화된 공개 URL

const response = await ai.models.generateContent({
  model: GEMINI_MODEL,
  contents: [
    {
      fileData: {
        fileUri: youtubeUrl,
      },
    },
    {
      text: `${SUMMARY_JSON_INSTRUCTION}\n\n위 YouTube 영상을 요약해 주세요.`,
    },
  ],
});

const raw = response.text;
```

| 입력 방식 (문서) | DocuSumm MVP |
|------------------|--------------|
| File API (대용량·재사용) | 미사용 |
| Inline Data (<100MB) | 미사용 |
| **YouTube URLs** | **사용 (유일한 영상 입력)** |
| Cloud Storage 등록 | 미사용 |

**YouTube URL 제약 (문서 기준)**

- **공개(public)** 영상만 지원. 비공개·일부 URL은 400/500 등으로 실패 가능.
- Preview 기능 — 요금·Rate limit 변경 가능.
- UI 썸네일·제목: [YouTube oEmbed](https://www.youtube.com/oembed) 등 **표시 전용** (요약 생성과 분리).

**구현 파일**

- `lib/gemini/summarize-text.ts` — §2.2
- `lib/gemini/summarize-youtube.ts` — §2.3
- `lib/gemini/parse-response.ts` — JSON 파싱·에러 매핑

### 3. 결제 로직 (Payment Logic - Stripe)

-   **상품 구성**: 30 크레딧 ($5), 50 크레딧 ($8), 100 크레딧 ($15).
-   **Webhook**: `checkout.session.completed` 이벤트를 수신하여 사용자 크레딧 증가 처리.

## 개발 설정 (Development Setup)

1. **설치**: `npx create-next-app@latest` (src 디렉토리 사용 안 함 옵션 선택).
2. **환경 변수**: `.env.local`에 `DATABASE_URL`, `GEMINI_API_KEY`, `DEV_USER_ID` 등 설정 (`.env.example` 참고).
3. **DB 스키마**: `pnpm db:push` — `drizzle.config.ts`가 `db/load-env.ts`로 `.env.local`을 읽음 (drizzle-kit은 Next.js와 별도 프로세스).
4. **Gemini SDK**: `pnpm add @google/genai` (`@google/generative-ai` 아님).
5. **실행**: `pnpm dev`.

## 구현 가이드 (Implementation Guide)

### 단계 1: UI/UX 프레임워크 (Epic 1)

-   *(완료)* Next.js 프로젝트 설정, Tailwind & Shadcn UI 설치.
-   앱 셸(루트 레이아웃, 라우팅, Toast Provider) 구성.
-   `Sidebar`, `InputPanel`, `SummaryCard` 등 기본 컴포넌트 퍼블리싱 (Mock 데이터 사용).

### 단계 2: 핵심 기능 (Epic 2)

-   Drizzle ORM 설정 (`db/schema.ts`, `drizzle.config.ts`) 및 Supabase 연결.
-   `lib/gemini` 구현 (`@google/genai`, YouTube는 `fileData.fileUri` 단일 호출).
-   UI와 `/api/summary` 연결.
-   요약 완료 후 결과를 `summaries` 테이블에 저장하는 로직 구현 (Drizzle 사용).
-   로딩 상태(Loading State) 처리.

### 단계 3: 인증 및 계정 (Epic 3)

**PRD 상세**: `docs/prd/docusumm-prd.md` — Epic 3 (Story 3.1~3.3)  
**개발 플랜**: `docs/plan/epic-3-auth-plan.md` — Task·일정·테스트·마이그레이션 SQL

**전제**: Google Cloud OAuth·Supabase Auth Google Provider 활성화 완료.

#### 3.1 의존성 및 환경 변수

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

```env
# .env.local / .env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Epic 2 임시 (개발 fallback만, Story 3.2 완료 후 제거 권장)
# DEV_USER_ID=...
# ALLOW_DEV_USER=true
```

서버 DB 접근은 기존과 동일하게 `DATABASE_URL`(postgres) + Drizzle. Epic 3에서 `SUPABASE_SERVICE_ROLE_KEY`는 필수 아님(세션은 SSR 쿠키 + `getUser()`).

#### 3.2 소스 트리 (신규·수정)

| 신규 | 수정 |
|------|------|
| `middleware.ts` | `app/api/summary/route.ts` |
| `lib/supabase/client.ts` | `app/api/summary/[id]/route.ts` |
| `lib/supabase/server.ts` | `app/dashboard/dashboard-client.tsx` |
| `lib/supabase/middleware.ts` | `db/schema.ts` (`users` 테이블) |
| `lib/auth/get-user.ts` | `.env.example` |
| `app/auth/callback/route.ts` | `lib/dev-user.ts` (deprecated) |
| `components/auth/login-dialog.tsx` | `app/dashboard/layout.tsx` |
| `components/auth/user-menu.tsx` | |
| `db/migrations/003_users.sql` (또는 `pnpm db:push`) | |

#### 3.3 Drizzle 스키마 — `users`

```typescript
// db/schema.ts (추가)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // auth.users.id와 동일
  email: text("email").notNull(),
  credits: integer("credits").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// summaries.userId → users.id FK
```

**프로필 동기화** (앱 레벨 권장):

```typescript
// lib/auth/ensure-user.ts
// requireAuthUser() 직후 API에서 호출
// INSERT ... ON CONFLICT (id) DO NOTHING
// 신규 insert 시 credits = 3 (FR003)
```

대안: Supabase Database Trigger on `auth.users` INSERT — 트리거 vs `ensureUser` 중 **하나만** 사용.

**기존 데이터**: `DEV_USER_ID`로 저장된 `summaries`는 실계정과 불일치 → 삭제 또는 테스트 전용으로 문서화.

#### 3.4 Middleware · API 인증

```typescript
// middleware.ts — matcher 예시
export const config = {
  matcher: ["/dashboard/:path*", "/api/summary/:path*"],
};
```

- 세션 없음 → 페이지: `/login?next=...`, API: `401 JSON`
- `@supabase/ssr` `updateSession`으로 쿠키 갱신

```typescript
// lib/auth/get-user.ts
export async function requireAuthUser(): Promise<{ id: string; email: string }> {
  const user = await getAuthUser();
  if (!user) throw new AuthError("UNAUTHORIZED");
  await ensureUserProfile(user);
  return user;
}
```

모든 `summaries` 쿼리에 `eq(summaries.userId, user.id)` 유지(NFR001). Drizzle + postgres 직결 시 **애플리케이션 레이어 격리**가 1차 방어선.

#### 3.5 Google OAuth 플로우

```typescript
// 클라이언트 (요지)
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${origin}/auth/callback`,
  },
});
```

```typescript
// app/auth/callback/route.ts
// createServerClient + exchangeCodeForSession + redirect /dashboard
```

#### 3.6 대시보드 · 히스토리

- `dashboard-client`: `MOCK_HISTORY` / `MOCK_DETAILS` fallback 제거
- `loadHistory()` 실패 시 빈 배열 + 안내 (Mock으로 되돌리지 않음)
- `HistorySidebar` + `groupSummariesByDate` 유지
- 헤더 `UserMenu`: email, signOut

#### 3.7 크레딧 (선택, FR007 최소)

Epic 3에 포함 시:

- `POST /api/summary` 전: `users.credits >= 1`
- `completed` 시: `credits -= 1`, `credit_transactions` insert (`type: 'usage'`)
- 부족: `402` + `{ error, code: 'INSUFFICIENT_CREDITS' }`

Epic 4는 Stripe 충전만 담당.

#### 3.8 구현 일정 (권장)

| 일차 | 작업 |
|------|------|
| 1 AM | Story 3.1 — 클라이언트, callback, Google 버튼 |
| 1 PM | Story 3.2 — middleware, API `requireAuthUser` |
| 2 AM | Story 3.3 — `users` 스키마, ensureUser, db:push |
| 2 PM | Mock 제거, 401 UX, E2E 회귀 |
| 3 (선택) | 크레딧 차감·402 |

### 단계 4: 결제 시스템 (Epic 4)

**PRD·플랜**: `docs/prd/docusumm-prd.md` Epic 4 · `docs/plan/epic-4-payment-plan.md`

#### 4.1 의존성·환경

```bash
pnpm add stripe
```

**상품·Price 등록**: Stripe Dashboard 수동이 아니라 **Stripe MCP** (`create_product`, `create_price`). Test 모드 카탈로그·Price ID: `docs/stripe/test-mode-catalog.md`.

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_30=price_1TeEJPIYzHZbjIp3QDStclbH
STRIPE_PRICE_ID_50=price_1TeEJPIYzHZbjIp3V09fcDu2
STRIPE_PRICE_ID_100=price_1TeEJPIYzHZbjIp3hJCN0Spv
```

#### 4.2 DB — `credit_transactions`

- `user_id`, `amount` (+/-), `type` (`bonus`|`charge`|`usage`)
- `stripe_checkout_session_id`, `stripe_event_id` UNIQUE (멱등)

#### 4.3 크레딧 ledger

- `lib/credits/ledger.ts` — `deductCredit`, `addCredits`
- `POST /api/summary` — 차감 후 insert, 402 `INSUFFICIENT_CREDITS`

#### 4.4 Stripe Checkout

- `POST /api/payment/checkout` — `packageId` → Checkout Session URL
- `app/billing/page.tsx` — 패키지 UI

#### 4.5 Webhook

- `app/api/webhooks/stripe/route.ts` — raw body + `constructEvent`
- `checkout.session.completed` → metadata 기반 충전
- 로컬: `stripe listen --forward-to localhost:3002/api/webhooks/stripe`

#### 4.6 일정 (권장)

| Day | 작업 |
|-----|------|
| D1 | ledger + 차감 + 402 UI |
| D2 | Checkout + billing |
| D3 | Webhook + E2E |

### 단계 5: 알림 (Epic 5)

-   Resend 연동하여 이메일 알림 구현.

### 단계 6: 구조화 요약 (Epic 6 — LilysAI 벤치마크)

-   `StructuredSummary` v2 스키마·프롬프트·파서.
-   `summary_options` DB 컬럼, API `options` body.
-   SummaryCard v2 (Insight, TOC, Sections, Citations).
-   Markdown보내기.

### 단계 7: 자료 기반 채팅 (Epic 7)

-   `/api/summary/[id]/chat` 스트리밍.
-   `ChatPanel` UI, `summary_messages` 테이블.

## 테스트 접근 방식 (Testing Approach)

-   **수동 테스트**: 전체 플로우 검증 (가입 -> 크레딧 확인 -> 요약 -> 이메일 수신).
-   **Stripe 테스트 모드**: 결제 및 크레딧 충전 로직 검증.

## 배포 전략 (Deployment Strategy)

-   **Vercel**: 프론트엔드 및 API 배포 최적화.
-   **Supabase**: 데이터베이스 및 인증 관리.
