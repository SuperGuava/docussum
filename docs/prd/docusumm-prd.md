# DocuSumm Product Requirements Document (PRD)

## 목표 및 배경 컨텍스트

### 목표

-   다양한 콘텐츠(텍스트, YouTube 영상)를 AI가 자동으로 요약해주는 고품질 유틸리티 SaaS 개발
-   글로벌 사용자를 타겟으로 한 해외 결제 시스템 및 이메일 자동화 구축
-   실제 수익화가 가능한 수준의 완성도 높은 서비스 구현

### 배경 컨텍스트

현대 사용자는 텍스트, PDF 문서, 영상 등 방대한 양의 정보에 노출되어 있으며, 이를 효율적으로 소비하고자 하는 니즈가 강함. DocuSumm은 AI 모델의 Long Context 강점을 활용하여 다양한 포맷의 자료를 빠르고 정확하게 요약해주는 서비스를 제공함으로써 생산성을 높이고자 함. 또한 글로벌 결제 및 알림 시스템을 통합하여 실제 운영 가능한 SaaS 모델을 검증하는 것을 목표로 함.

### 벤치마크: LilysAI ([lilys.ai/ko](https://lilys.ai/ko/))

[LilysAI](https://lilys.ai/ko/)는 유튜브·PDF·웹·오디오 등을 **구조화 요약 + 출처 + 길이/난이도 조절 + 해설/채팅**으로 제공하는 국내 대표 요약 AI이다. DocuSumm은 MVP(Epic 1~5) 이후 **요약 품질·신뢰·가독성**을 Lilys 수준에 가깝게 끌어올리는 것을 Phase 2 목표로 한다.

| LilysAI 강점 | DocuSumm 반영 계획 | 단계 |
|--------------|-------------------|------|
| 계층형 목차 + 본문 구조 | `sections[]` + TOC UI | Phase 2 (Epic 6) |
| 상단 핵심 인사이트(한 줄 요약) | `insight` 필드 + Hero 영역 | Phase 2 |
| 짧게/기본/길게, 쉬게(난이도) | `summaryOptions` (length, tone) | Phase 2 |
| 출처 보기(문장·영상 구간) | `citations[]` (YouTube `?t=` 링크) | Phase 2 |
| 자료 기반 AI 채팅·해설 | 요약 본문 Q&A, 선택 구간 해설 | Phase 3 (Epic 7) |
| PDF·웹 URL·구독·확장 프로그램 | 웹 URL 입력 → PDF → 구독 | Phase 4+ |
| 30+ 리포트 템플릿·마인드맵 | Markdown보내기 우선, 시각화는 후순위 | Phase 2~4 |

**DocuSumm 차별화 (유지)**

- Pay-as-you-go 크레딧 + Stripe 글로벌 결제 (Lilys와 다른 수익 모델)
- Gemini Video Understanding으로 **YouTube URL 직접 요약** (자막 파이프라인 없음)
- 단순·빠른 대시보드 UX (Simplicity 유지)

---

## 요구사항

### 기능 요구사항 (Functional Requirements)

#### 인증 (Authentication)

-   **FR001**: 사용자는 소셜 로그인(Google 등)을 통해 가입 및 로그인할 수 있어야 한다.
-   **FR002**: 로그인하지 않은 사용자는 서비스의 주요 기능(요약, 히스토리 등)에 접근할 수 없어야 한다 (Protected Routes).
-   **FR003**: 신규 가입 사용자에게는 **3 크레딧(요약 3회 분량)**의 무료 크레딧이 자동으로 지급되어야 한다.

#### 문서 관리 (Document Management)

-   **FR004**: 사용자는 자신의 과거 요약 요청 목록(History)을 날짜별로 조회할 수 있어야 한다.

#### AI 요약 (AI Summarization)

-   **FR005**: 사용자는 직접 텍스트를 입력하거나, YouTube 영상 URL을 입력하여 요약을 요청할 수 있어야 한다.
-   **FR006**: 시스템은 AI 모델을 활용하여 입력된 콘텐츠(긴 텍스트 포함)를 요약해야 한다. 서버 SDK는 **`@google/genai`**(Google Gen AI SDK)를 사용하며, 레거시 `@google/generative-ai`는 사용하지 않는다. YouTube 영상은 **`generateContent`에 `fileData.fileUri`로 공개 YouTube URL을 직접 전달**하여 요약하며, 자막·STT·별도 텍스트 추출 단계는 사용하지 않는다.
-   **FR007**: 요약 요청 1회당 **1 크레딧**을 차감하며, 잔액 부족 시 요청을 거부해야 한다.
-   **FR008**: 요약 작업은 시간이 소요될 수 있으므로 백그라운드에서 비동기적으로 처리되어야 한다.
-   **FR013**: 사용자는 요약 생성 시 **길이(짧게/기본/길게)** 와 **문체(기본/쉬게)** 를 선택할 수 있어야 한다.
-   **FR014**: 요약 결과는 **핵심 인사이트 1문단**, **TL;DR 3줄**, **계층형 목차**, **섹션별 본문(Markdown)** 구조로 제공되어야 한다.
-   **FR015**: YouTube 요약의 경우, 가능한 범위에서 **출처 링크(영상 URL + 타임스탬프)** 를 섹션 또는 bullet에 포함해야 한다.
-   **FR016**: 사용자는 요약 결과를 **Markdown 파일로 보내기** 할 수 있어야 한다.
-   **FR017**: (Phase 3) 사용자는 저장된 요약을 기준으로 **자료 기반 Q&A 채팅**을 할 수 있어야 한다 (환각 최소화, 요약/원문 범위 내 답변).
-   **FR018**: (Phase 3) 사용자는 요약 본문에서 선택한 구간에 대해 **원클릭 해설**을 요청할 수 있어야 한다.

#### 이메일 자동화 (Email Automation)

-   **FR009**: 요약이 완료되면 시스템은 사용자에게 "요약 완료 알림" 이메일을 자동으로 발송해야 한다.
-   **FR010**: 이메일에는 요약 결과 페이지로 바로 이동할 수 있는 링크가 포함되어야 한다.

#### 해외 결제 (Global Payment)

-   **FR011**: 사용자는 글로벌 결제 서비스를 통해 **30 크레딧($5), 50 크레딧($8), 100 크레딧($15)** 단위 등 패키지로 크레딧을 충전할 수 있어야 한다.
-   **FR012**: 결제가 완료되면 해당 금액만큼의 크레딧이 사용자 계정에 즉시 충전되어야 한다.

### 비기능 요구사항 (Non-Functional Requirements)

-   **NFR001**: 사용자 데이터(요약본)는 철저히 격리되어 본인만 접근 가능해야 한다.
-   **NFR002**: 글로벌 결제 테스트를 위해 결제 서비스의 Test 모드와 Production 모드를 환경 변수로 분리하여 관리해야 한다.

---

## 사용자 여정 (User Journeys)

### 여정 1: 신규 사용자 요약 요청 및 결과 확인

1. 사용자가 메인 페이지(대시보드)에 접속하여 바로 텍스트를 입력하거나 YouTube URL을 붙여넣는다.
2. "요약하기" 버튼을 클릭한다.
3. (로그인하지 않은 경우) 로그인 모달이 뜨고 구글 소셜 로그인을 진행한다.
4. 로그인 완료 시 자동으로 요약 요청이 시작되며, 신규 가입 보너스 크레딧이 차감된다.
5. "요약이 시작되었습니다. 완료되면 이메일로 알려드립니다"라는 메시지를 확인한다.
6. 잠시 후, 가입한 이메일로 "DocuSumm: 요약이 완료되었습니다"라는 메일을 수신하고 결과를 확인한다.

### 여정 2: 크레딧 충전 (Pay-as-you-go)

1. 무료 크레딧을 모두 소진한 사용자가 추가 요약을 시도한다.
2. "크레딧이 부족합니다. 추가 크레딧을 충전하세요"라는 모달이 표시된다.
3. "충전하기" 버튼을 클릭하여 크레딧 구매 페이지로 이동한다.
4. 원하는 크레딧 패키지(예: 30회분 $5, 50회분 $8, 100회분 $15)를 선택하고 결제를 진행한다.
5. 결제 성공 후 크레딧이 즉시 충전되며, 중단되었던 요약 요청을 다시 진행한다.

---

## UX 디자인 원칙

### 핵심 원칙

-   **Simplicity (단순성)**: 별도의 시작 버튼 없이 메인 화면에서 즉시 입력이 가능해야 한다.
-   **Feedback (피드백)**: 비동기 작업의 특성상, 작업 시작/진행/완료 상태를 사용자에게 명확히 인지시켜야 한다.
-   **Focus (집중)**: 요약 결과 화면은 텍스트 가독성을 최우선으로 하여 불필요한 요소를 배제한다.
-   **Trust (신뢰)**: 결제·개인 문서 처리의 안전함과 함께, **출처가 있는 요약**으로 AI 결과에 대한 신뢰를 높인다 (LilysAI의 "출처 보기" 패턴).
-   **Scannable (훑어보기)**: 긴 영상·글도 목차·TL;DR·인사이트로 30초 안에 전체 맥락을 파악할 수 있어야 한다.

### 플랫폼 및 화면

-   **플랫폼**: 데스크톱 웹 (반응형 지원)
-   **핵심 화면**:
    -   대시보드 (메인 페이지, 입력 패널 통합)
    -   요약 상세 보기 (Markdown 렌더링)
    -   결제 및 설정 페이지

### 디자인 제약사항

-   AI 모델의 응답 시간에 따라 로딩 상태가 길어질 수 있음을 고려한 UI 설계 필요 (스켈레톤 UI 등)
-   유튜브 요약의 경우 썸네일 및 영상 메타데이터를 함께 표시하여 시각적 매력도 증대

---

## UI 디자인 목표

### 주요 UI 요소

1. **입력 패널 (Input Panel)**

    - 메인 화면 중앙에 위치 (Lading Page와 Dashboard 통합)
    - 탭 기반 인터페이스 (Text / YouTube)
    - URL 유효성 검사 및 실시간 피드백

2. **요약 결과 카드 (Summary Card)** — *Phase 2에서 Lilys 스타일로 확장*

    - **Insight Hero**: 한 문단 핵심 인사이트 (Lilys 상단 요약 블록)
    - **TL;DR**: 3줄 불릿 (기존 유지)
    - **목차 (TOC)**: `sections` 기반 앵커 네비게이션, 접기/펼치기
    - **본문**: H2/H3 계층 + 불릿 Markdown
    - **출처**: YouTube 타임스탬프 링크 `[출처 보기]` (Phase 2)
    - **옵션 툴바**: 짧게/기본/길게, 쉬게 — 재요약 시 반영 (Phase 2)
    - **보내기**: 복사, Markdown 다운로드, 공유 (Phase 2)

3. **요약 옵션 바 (Summary Options Bar)** — *Phase 2 신규*

    - 입력 패널 하단 또는 요약하기 직전: 길이·문체 세그먼트 컨트롤 (Lilys: 짧게/기본/길게/쉽게)

4. **히스토리 리스트 (Sidebar History)**

    - 좌측 사이드바에 배치 (ChatGPT 스타일)
    - 날짜별 그룹핑 및 요약 제목 리스트
    - 클릭 시 우측 메인 영역에 해당 요약 결과 로드

5. **자료 기반 채팅 패널 (Phase 3)** — *Lilys "Lily 채팅" 참고*

    - 요약 상세 우측 또는 하단 드로어
    - 현재 요약 ID 컨텍스트 고정, 스트리밍 응답

### 인터랙션 패턴

-   사이드바 접기/펼치기 (Collapsible Sidebar)
-   긴 텍스트 입력 시 자동 높이 조절 (Auto-resize)
-   결제 진행 시 오버레이 모달 사용
-   토스트 메시지(Toast)를 활용한 상태 알림

---

## Epic 목록

### Epic 1: UI/UX 프레임워크 개발 (UI Only)

**목표**: 메인 대시보드, 사이드바, 입력 패널 등 핵심 화면의 퍼블리싱 및 반응형 UI 구현 (기능 제외)

**예상 스토리 수**: 3

**범위**: API 연동, 인증, DB, 결제 로직은 포함하지 않음. Mock 데이터와 클라이언트 상태만 사용.

**선행 완료**: Next.js 16 App Router 프로젝트 초기화, Tailwind CSS, Shadcn UI 설정

---

#### Story 1.1: 앱 셸 및 공통 레이아웃 구성

**As a** 개발자,  
**I want** 루트 레이아웃·라우팅·토스트 알림 등 앱 셸(App Shell)을 정리하기를,  
**So that** Epic 1 UI 컴포넌트를 일관된 구조 위에서 바로 개발할 수 있다.

**관련 요구사항**: UX 원칙(Simplicity, Focus), UI 디자인 목표

**작업 범위**

- 루트 `layout.tsx`: 글로벌 폰트, 메타데이터, 기본 배경/컨테이너 스타일
- `/` → `/dashboard` 리다이렉트 또는 랜딩 → 대시보드 진입 구조
- 토스트(Toast) Provider 및 공통 알림 패턴 연결
- Epic 1에서 사용할 Shadcn 컴포넌트(Tabs, Skeleton, Collapsible 등) 사전 add — **프로젝트/Shadcn 초기화 작업은 제외**

**수용 기준 (Acceptance Criteria)**

- [ ] `npm run dev` 실행 시 오류 없이 대시보드 경로에 접근 가능하다.
- [ ] 루트 레이아웃에 글로벌 스타일과 메타데이터가 적용되어 있다.
- [ ] `/` 접속 시 대시보드(또는 정의된 진입 화면)로 이동한다.
- [ ] 토스트 메시지를 트리거할 수 있는 공통 Provider가 동작한다.
- [ ] 데스크톱(≥1024px)과 모바일(≤768px)에서 기본 레이아웃이 깨지지 않는다.

---

#### Story 1.2: 대시보드 레이아웃 및 히스토리 사이드바 UI

**As a** 사용자,  
**I want** ChatGPT 스타일의 접을 수 있는 사이드바에서 과거 요약 목록을 날짜별로 볼 수 있기를,  
**So that** 이전에 요약한 콘텐츠를 빠르게 찾아 다시 열어볼 수 있다.

**관련 요구사항**: FR004(히스토리 조회), UI 디자인 목표 — 히스토리 리스트

**작업 범위**

- `app/dashboard/layout.tsx`: 좌측 사이드바 + 우측 메인 콘텐츠 2-column 레이아웃
- `Sidebar` 컴포넌트: 접기/펼치기(Collapsible) 토글
- Mock 히스토리 데이터(오늘/어제/이번 주 그룹)로 날짜별 그룹핑 리스트 렌더링
- 항목 클릭 시 우측 메인 영역에 해당 Mock 요약 결과 표시(상태만 전환, API 없음)
- 모바일: 사이드바 오버레이 또는 햄버거 메뉴로 전환

**수용 기준 (Acceptance Criteria)**

- [ ] 사이드바는 "오늘", "어제", "이전" 등 날짜 라벨로 그룹핑된 Mock 목록을 표시한다.
- [ ] 각 히스토리 항목에는 요약 제목(1줄 truncate)과 소스 타입 아이콘(Text/YouTube)이 보인다.
- [ ] 사이드바 접기/펼치기가 부드럽게 동작하고, 접힌 상태에서도 아이콘만으로 토글이 가능하다.
- [ ] 히스토리 항목 클릭 시 우측 메인 영역에 해당 Mock `SummaryCard`가 로드된다.
- [ ] 768px 이하 뷰포트에서 사이드바가 오버레이 또는 드로어 형태로 동작한다.

---

#### Story 1.3: 입력 패널 및 요약 결과 카드 UI

**As a** 사용자,  
**I want** 메인 화면 중앙에서 텍스트 또는 YouTube URL을 입력하고 요약 결과를 읽기 좋은 형태로 확인하기를,  
**So that** 별도 페이지 이동 없이 요약 작업의 전체 흐름을 한 화면에서 경험할 수 있다.

**관련 요구사항**: FR005(텍스트/YouTube 입력), UI 디자인 목표 — 입력 패널, 요약 결과 카드

**작업 범위**

- `InputPanel` 컴포넌트: Text / YouTube 탭 전환
    - Text 탭: auto-resize textarea, 글자 수 표시(선택)
    - YouTube 탭: URL 입력 필드 + 클라이언트 유효성 검사(정규식), 실시간 에러/성공 피드백
- "요약하기" 버튼: 입력값 없을 때 disabled, 클릭 시 Mock 로딩 상태(스켈레톤) → Mock 결과 표시
- `SummaryCard` 컴포넌트:
    - TL;DR 3줄 요약 섹션(강조 스타일)
    - Markdown 렌더링 본문(Mock 데이터)
    - YouTube 소스일 경우 Mock 썸네일 + 영상 제목 메타데이터 영역
    - "복사하기", "공유하기" 버튼(UI만, 클립보드/공유 API는 Story 2.4 또는 Epic 5에서 연결)
- 로딩 중: `SummaryCard` 영역에 Skeleton UI 표시

**수용 기준 (Acceptance Criteria)**

- [ ] Text / YouTube 탭 전환이 즉시 반영되며, 탭별 입력 UI가 올바르게 표시된다.
- [ ] YouTube URL이 `youtube.com` 또는 `youtu.be` 형식이 아니면 입력 필드 하단에 에러 메시지가 표시된다.
- [ ] "요약하기" 클릭 시 1~2초 Mock 로딩(스켈레톤) 후 Mock 요약 결과가 렌더링된다.
- [ ] TL;DR 섹션이 본문과 시각적으로 구분되며, Markdown(제목, 목록, 굵게)이 올바르게 렌더링된다.
- [ ] YouTube Mock 항목 선택 시 썸네일과 영상 제목 placeholder가 SummaryCard 상단에 표시된다.
- [ ] 긴 텍스트 입력 시 textarea가 자동으로 높이가 늘어난다.

---

### Epic 2: 핵심 기능 (Core Features) - 요약 엔진 및 결과 저장

**목표**: UI에 Gemini API를 연동하여 요약을 수행하고, 결과를 데이터베이스에 저장하는 전체 파이프라인 구축

**예상 스토리 수**: 4

**범위**: 인증·크레딧·이메일은 Epic 3~5에서 처리. Epic 2에서는 개발용 고정 `user_id` 또는 임시 식별자로 DB 저장 가능.

**선행 조건**: Epic 1 완료(입력 패널, SummaryCard, 로딩 UI)

---

#### Story 2.1: 데이터베이스 스키마 및 Drizzle ORM 설정

**As a** 개발자,  
**I want** Supabase PostgreSQL에 Drizzle ORM으로 `summaries` 테이블을 정의하고 마이그레이션하기를,  
**So that** 요약 요청과 결과를 타입 안전하게 저장·조회할 수 있다.

**관련 요구사항**: FR006(요약 수행), FR008(비동기 처리), NFR001(데이터 격리 — 스키마 준비)

**작업 범위**

- `db/schema.ts`: `summaries` 테이블 정의
    - `id`, `user_id`, `source_type`(`text` | `youtube`), `original_content`, `summary_text`, `status`(`pending` | `completed` | `failed`), `title`(요약 제목, TL;DR 첫 줄 또는 AI 생성), `metadata`(YouTube 썸네일/제목 JSON, 선택), `created_at`
- `drizzle.config.ts` 및 Supabase 연결 설정
- `drizzle-kit push` 또는 migrate로 스키마 반영
- Epic 2 개발용: `user_id`에 고정 UUID 또는 환경 변수 `DEV_USER_ID` 사용

**수용 기준 (Acceptance Criteria)**

- [ ] `summaries` 테이블이 Supabase에 생성되고, Drizzle Studio 또는 SQL로 확인 가능하다.
- [ ] `source_type`, `status` CHECK 제약이 올바르게 적용된다.
- [ ] TypeScript에서 `Summary` 타입을 import하여 컴파일 타임 타입 검사가 통과한다.
- [ ] Drizzle을 통해 `insert`, `select`, `update`(status 변경) 쿼리가 로컬에서 동작한다.

---

#### Story 2.2: Gemini API 요약 엔진 구현

**As a** 시스템,  
**I want** Google Gemini API를 호출하여 텍스트와 YouTube URL을 요약하기를,  
**So that** 사용자 입력을 AI 기반 요약 결과로 변환할 수 있다.

**관련 요구사항**: FR005, FR006

**레퍼런스**

- SDK: [@google/genai (npm)](https://www.npmjs.com/package/@google/genai)
- YouTube 요약: [Gemini API — 동영상 이해 (Video understanding)](https://ai.google.dev/gemini-api/docs/video-understanding?hl=ko)

**Gemini SDK (고정)**

| 항목 | 내용 |
|------|------|
| 패키지 | `@google/genai` (`npm i @google/genai`) |
| 사용 금지 | `@google/generative-ai` (레거시 SDK) |
| 클라이언트 | `GoogleGenAI` — 서버 전용, API Route에서만 초기화 |
| 환경 변수 | `GEMINI_API_KEY` (또는 SDK 문서의 `GOOGLE_API_KEY`) |
| 기본 모델 | `gemini-2.0-flash` (프로젝트 정책; API 문서 권장 모델로 교체 가능) |

**텍스트 요약 API (간단 호출)**

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [SUMMARY_JSON_INSTRUCTION, `Summarize:\n\n${text}`],
});
const raw = response.text;
```

**YouTube 요약 API (간단 호출 — Pass YouTube URLs)**

공식 문서의 **YouTube URL을 `generateContent`에 직접 전달**하는 방식을 사용한다. File API 업로드·yt-dlp·자막 추출 없이 **단일 `generateContent` 호출**로 처리한다.

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [
    {
      fileData: {
        fileUri: "https://www.youtube.com/watch?v=VIDEO_ID",
      },
    },
    {
      text: `${SUMMARY_JSON_INSTRUCTION}\n\n위 YouTube 영상을 요약해 주세요.`,
    },
  ],
});
const raw = response.text;
```

- **사용하지 않음**: `Part.from_uri` + `mime_type: video/mp4` 조합(YouTube URL에 부적합), YouTube 자막/caption 추출, yt-dlp, Whisper/STT, transcript → LLM 2단계 파이프라인
- **제약 (공식 문서)**: **공개(public)** 영상만 지원, 비공개·일부 미등록 영상은 실패 처리. YouTube URL 기능은 Preview 단계이며 요금/한도가 변경될 수 있음
- UI용 썸네일·영상 제목은 oEmbed 등 **표시용 메타데이터**만 별도 조회 (요약 본문 생성과 무관)

**작업 범위**

- `lib/gemini/client.ts`: `GoogleGenAI` 싱글톤/팩토리 (`@google/genai`)
- `lib/gemini/summarize-text.ts`: `ai.models.generateContent` — 텍스트 `contents`
    - 출력 형식: `{ title, tldr: string[], body: string }` (Markdown 본문, JSON 파싱)
    - Context Window 초과 시 명확한 에러 메시지
- `lib/gemini/summarize-youtube.ts`: `fileData.fileUri` + 요약 프롬프트 **단일 호출**
    - 입력: 정규화된 `https://www.youtube.com/watch?v=...` URL
    - 출력: 텍스트 요약과 동일 + `{ thumbnailUrl, videoTitle }` (oEmbed 보조)
    - 비공개/삭제/접근 불가 영상: `failed` + 사용자 메시지
- 공통 프롬프트: TL;DR 3줄 + 상세 Markdown 본문 JSON 응답 지시

**수용 기준 (Acceptance Criteria)**

- [ ] `package.json`에 `@google/genai`만 사용하고 `@google/generative-ai`는 없다.
- [ ] 500자 이상 텍스트 입력 시 TL;DR 3줄 + Markdown 본문이 반환된다.
- [ ] 공개 YouTube URL 입력 시 `fileData.fileUri` 단일 `generateContent` 호출로 요약이 반환된다.
- [ ] YouTube 요약 경로에 자막 추출·STT·transcript·File API 업로드 단계가 없다.
- [ ] API 키 누락 또는 Gemini 오류 시 throw되는 에러가 상위에서 catch 가능한 형태다.
- [ ] 토큰 한도 초과 입력에 대해 "입력이 너무 깁니다"류의 사용자 친화적 에러가 반환된다.
- [ ] 단위 테스트 또는 스크립트로 텍스트/YouTube 각 1회 이상 수동 검증 완료.

---

#### Story 2.3: 요약 API Route 및 비동기 처리 파이프라인

**As a** 사용자,  
**I want** "요약하기" 클릭 시 서버가 요약 작업을 백그라운드에서 처리하고 DB에 결과를 저장하기를,  
**So that** 긴 AI 처리 시간 동안에도 UI가 응답성을 유지할 수 있다.

**관련 요구사항**: FR006, FR008

**작업 범위**

- `POST /api/summary` API Route
    - Request body: `{ sourceType: 'text' | 'youtube', content: string }`
    - 유효성 검사: 빈 입력, 잘못된 YouTube URL 거부 (400)
    - `sourceType` 분기:
        - `'text'` → `summarize-text`
        - `'youtube'` → `summarize-youtube`(URL 직접 전달, transcript 단계 없음)
    - 처리 흐름:
        1. `summaries`에 `status: pending` 레코드 insert → `summaryId` 반환 (202 Accepted)
        2. `waitUntil` 또는 fire-and-forget 패턴으로 Gemini 호출
        3. 성공 시 `status: completed`, `summary_text`/`title`/`metadata` update
        4. 실패 시 `status: failed`, 에러 로그 기록
- `GET /api/summary/[id]`: 요약 상태 및 결과 조회 (폴링용)

**수용 기준 (Acceptance Criteria)**

- [ ] POST 요청 직후 202 응답과 `{ summaryId }`가 반환된다.
- [ ] DB에 `pending` 상태 레코드가 즉시 생성된다.
- [ ] Gemini 처리 완료 후 동일 레코드가 `completed`로 업데이트되고 `summary_text`가 채워진다.
- [ ] Gemini 오류 시 레코드가 `failed`로 업데이트된다.
- [ ] GET `/api/summary/[id]`로 `pending` → `completed` 상태 전환을 확인할 수 있다.
- [ ] Epic 2 단계에서는 크레딧 차감(FR007)을 생략하거나 stub 처리한다.

---

#### Story 2.4: UI-API 연동 및 로딩·에러 상태 처리

**As a** 사용자,  
**I want** 입력 패널에서 실제 요약을 요청하고 완료될 때까지 진행 상태를 확인한 뒤 결과를 화면에 보기를,  
**So that** Mock이 아닌 실제 AI 요약 결과를 서비스에서 사용할 수 있다.

**관련 요구사항**: FR005, FR006, FR008, UX 원칙(Feedback)

**작업 범위**

- `InputPanel`: "요약하기" 클릭 → `POST /api/summary` 호출
- 폴링 또는 SWR/React Query로 `GET /api/summary/[id]` 주기적 조회 (3~5초 간격)
- 상태별 UI:
    - `pending`: SummaryCard 영역 Skeleton + "요약 중입니다..." 메시지
    - `completed`: 실제 `SummaryCard`에 TL;DR, Markdown, YouTube 메타데이터 렌더링
    - `failed`: 에러 토스트 + 재시도 버튼
- "복사하기": `summary_text` 클립보드 복사 + 성공 토스트
- 새 요약 완료 시 사이드바 Mock 목록을 실제 DB 조회로 교체(Epic 3 전까지는 로컬 state에 새 항목 append 가능)

**수용 기준 (Acceptance Criteria)**

- [ ] Text 탭에서 실제 텍스트 입력 → 요약 완료까지 End-to-End 플로우가 동작한다.
- [ ] YouTube 탭에서 공개 영상 URL → 요약 + 썸네일/제목이 SummaryCard에 표시된다.
- [ ] 요약 처리 중 "요약하기" 버튼이 disabled되고 Skeleton UI가 표시된다.
- [ ] `failed` 상태에서 사용자에게 원인 메시지(한국어)와 재시도 옵션이 제공된다.
- [ ] "복사하기" 클릭 시 요약 본문이 클립보드에 복사되고 토스트가 표시된다.
- [ ] 네트워크 오류 시 적절한 에러 토스트가 표시된다.

### Epic 3: 인증 및 계정 관리 (히스토리)

**목표**: 사용자 식별(Supabase) 및 개인별 저장된 요약 히스토리 조회/관리 기능 구현

**개발 플랜**: [docs/plan/epic-3-auth-plan.md](../plan/epic-3-auth-plan.md) (Task 체크리스트·일정·테스트)

**예상 스토리 수**: 3

**관련 요구사항**: FR001, FR002, FR003, FR004, NFR001  
**선행 조건**: Epic 1·2 완료(대시보드, `/api/summary`, Drizzle `summaries`)  
**인프라 선행(완료 가정)**: Google Cloud Console OAuth 클라이언트, Supabase Auth Google Provider 활성화

**Epic 3 한 줄 정의**: Supabase Auth(Google)로 사용자를 식별하고, `DEV_USER_ID`를 제거한 뒤 요약·히스토리를 로그인 사용자별로만 접근 가능하게 한다.

| FR | Epic 3 범위 | Epic 4 이후 |
|----|-------------|-------------|
| FR001 | Google 소셜 로그인·로그아웃 | — |
| FR002 | `/dashboard`, `/api/summary` 보호 | — |
| FR003 | `users` 행 생성 + 가입 보너스 3 크레딧 | Stripe 충전(FR011~012) |
| FR004 | DB 히스토리만 표시(Mock 제거) | — |
| FR007 | (선택) 잔액 0이면 402 거부 | Epic 4와 함께 완성 권장 |
| NFR001 | API `user_id` 필터 강제 | DB RLS는 2단계(선택) |

**현재 코드 갭 (Epic 2 기준)**

| 항목 | 현재 | Epic 3 후 |
|------|------|-----------|
| 사용자 ID | `getDevUserId()` + `DEV_USER_ID` | `auth.users.id` = `summaries.user_id` |
| Auth SDK | 미설치 | `@supabase/supabase-js`, `@supabase/ssr` |
| 라우트 보호 | `middleware.ts` 없음 | `/dashboard`, `/api/summary` 보호 |
| `users` 테이블 | 없음 | `public.users` + 프로필 동기화 |
| 히스토리 | API 실패 시 Mock fallback | 로그인 사용자 DB만 |

**구현 순서**

1. Story 3.1 — Auth 클라이언트·callback·Google 로그인 UI  
2. Story 3.2 — Middleware·API `requireAuthUser`  
3. Story 3.3 — `users` 테이블·ensureUser·히스토리 Mock 제거·(선택) 크레딧 차감  

---

#### Story 3.1: Supabase Auth 및 Google 로그인 (FR001)

**As a** 방문자,  
**I want** Google 계정으로 가입·로그인하기를,  
**So that** 내 요약이 계정에 저장된다.

**작업 범위**

- 패키지: `@supabase/supabase-js`, `@supabase/ssr`
- `lib/supabase/client.ts`, `server.ts`, `middleware.ts` (세션 갱신 헬퍼)
- `app/auth/callback/route.ts` — OAuth code → session
- `components/auth/login-dialog.tsx`, `google-sign-in-button.tsx`
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase 대시보드 (재확인)**

| 설정 | 로컬 | 프로덕션 |
|------|------|----------|
| Site URL | `http://localhost:3000` | 배포 도메인 |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://{domain}/auth/callback` |

**수용 기준**

- [ ] Google 로그인 후 `/dashboard` 접근 가능
- [ ] 로그아웃 시 세션 제거
- [ ] `auth/callback` 에러 없이 리다이렉트

---

#### Story 3.2: 보호 라우트 및 API 인증 (FR002, NFR001)

**As a** 서비스 운영자,  
**I want** 비로그인 사용자가 요약 API와 대시보드에 접근하지 못하게 하기를,  
**So that** 데이터가 사용자별로 격리된다.

**작업 범위**

- 루트 `middleware.ts` — matcher: `/dashboard/:path*`, `/api/summary/:path*`
- `lib/auth/get-user.ts` — `getAuthUser()`, `requireAuthUser()`
- `app/api/summary/route.ts`, `app/api/summary/[id]/route.ts`에서 `getDevUserId()` 제거
- API: 미로그인 → `401`; DB 오류 → `503` (구분 유지)
- 클라이언트: `401` 시 로그인 모달 (선택: 로그인 후 pending 요약 재개)

**개발 편의 (선택, 팀 합의)**

- `NODE_ENV=development` && `ALLOW_DEV_USER=true`일 때만 `DEV_USER_ID` fallback — 프로덕션 전 제거

**수용 기준**

- [ ] 비로그인 `GET/POST /api/summary` → 401
- [ ] 비로그인 `/dashboard` → 로그인 유도
- [ ] 사용자 A가 사용자 B의 `summary/[id]` 조회 불가

---

#### Story 3.3: 사용자 프로필 · 개인 히스토리 · Mock 제거 (FR003, FR004)

**As a** 로그인 사용자,  
**I want** 가입 보너스 크레딧과 나만의 요약 히스토리를 보기를,  
**So that** 이전 작업을 이어서 할 수 있다.

**작업 범위**

- Drizzle `users` 테이블: `id`(auth.users PK), `email`, `credits`(default 3), `created_at`
- `summaries.user_id` → `users.id` FK (기존 `DEV_USER_ID` 데이터는 테스트 데이터로 간주·삭제 권장)
- `ensureUserProfile(user)` — 첫 API 호출 시 idempotent insert, 신규만 `credits=3`
- `dashboard-client`: `MOCK_HISTORY` / `MOCK_DETAILS` fallback 제거, 빈 상태 UI
- 헤더: 이메일·로그아웃 (`user-menu`)
- (선택) `DELETE /api/summary/[id]`
- (선택, FR007 최소) 요약 전 `credits >= 1`, 완료 시 1 차감, 0이면 `402` + 충전 안내 문구(Epic 4 결제 연동 전)

**수용 기준**

- [ ] 최초 로그인 시 `public.users` 행 생성, `credits = 3`
- [ ] 사이드바는 본인 `summaries`만 날짜별 그룹 표시
- [ ] 항목 클릭 시 `GET /api/summary/[id]` 상세 로드
- [ ] (선택) 요약 1회당 크레딧 1 차감, 부족 시 402

**수동 테스트 시나리오**

1. 시크릿 창 → `/dashboard` → 로그인 유도  
2. Google 로그인 → callback → 대시보드  
3. Supabase: `auth.users` + `public.users` (`credits=3`) 확인  
4. 요약 생성 → `summaries.user_id` = 본인 UUID  
5. 타 계정으로 동일 summary URL 접근 → 404/403  
6. 로그아웃 → API 401  

**Epic 4·5 경계**

| Epic | 담당 |
|------|------|
| Epic 3 | Auth, `users`, 개인 히스토리, (선택) 크레딧 차감·가입 보너스 |
| Epic 4 | Stripe Checkout, Webhook, 패키지 충전 |
| Epic 5 | Resend, 요약 완료 이메일(FR009~010) |

---

### Epic 4: 결제 시스템 (수익화)

**목표**: 글로벌 결제 연동(Stripe) 및 크레딧 충전/차감 로직 구현

**개발 플랜**: [docs/plan/epic-4-payment-plan.md](../plan/epic-4-payment-plan.md)

**예상 스토리 수**: 4

**관련 요구사항**: FR007, FR011, FR012, NFR002  
**선행 조건**: Epic 3 (`users`, `requireAuthUser`, 로그인)

| FR | Epic 4 범위 |
|----|-------------|
| FR007 | 요약 1회 1 크레딧, 0이면 402 |
| FR011 | 30/$5, 50/$8, 100/$15 패키지 Checkout |
| FR012 | Webhook 즉시 충전 |
| NFR002 | Stripe Test/Live env 분리 |

**구현 순서**

1. Story 4.1 — `credit_transactions` + ledger + Stripe env  
2. Story 4.2 — 요약 API 차감 + 부족 모달 + 잔액 UI  
3. Story 4.3 — Checkout API + `/billing` 페이지  
4. Story 4.4 — Webhook `checkout.session.completed` + 멱등  

---

#### Story 4.1: 크레딧 원장 및 Stripe 설정

**As a** 개발자,  
**I want** 크레딧 증감을 `credit_transactions`에 기록하고 Stripe 패키지를 코드로 관리하기를,  
**So that** 충전·사용이 추적 가능하다.

**수용 기준**

- [ ] `credit_transactions` 테이블 Supabase 반영
- [ ] `lib/credits/ledger.ts` — `addCredits`, `deductCredit`, `getBalance`
- [ ] Stripe MCP로 Test Product/Price 3종 등록 후 Price ID를 env에 설정 (`docs/stripe/test-mode-catalog.md`)

---

#### Story 4.2: 요약 시 크레딧 차감 (FR007)

**As a** 사용자,  
**I want** 요약할 때마다 1 크레딧이 차감되고 없으면 안내받기를,  
**So that** Pay-as-you-go가 동작한다.

**수용 기준**

- [ ] `POST /api/summary` 선차감 1 크레딧
- [ ] 부족 시 402 + `INSUFFICIENT_CREDITS`
- [ ] 헤더/대시보드에 잔여 크레딧 표시

---

#### Story 4.3: Stripe Checkout · 결제 UI (FR011)

**As a** 사용자,  
**I want** 패키지를 선택해 Stripe로 결제하기를,  
**So that** 크레딧을 충전할 수 있다.

**수용 기준**

- [ ] `POST /api/payment/checkout` → Checkout URL
- [ ] `/billing` 패키지 카드 UI
- [ ] success/cancel 복귀 UX

---

#### Story 4.4: Webhook 즉시 충전 (FR012)

**As a** 사용자,  
**I want** 결제 직후 크레딧이 반영되기를,  
**So that** 바로 요약을 이어갈 수 있다.

**수용 기준**

- [ ] `POST /api/webhooks/stripe` 서명 검증
- [ ] `checkout.session.completed` → `users.credits` 증가
- [ ] 중복 Webhook 이중 충전 방지

---

### Epic 5: 알림 및 이메일 서비스

**목표**: 요약 완료 이메일(Resend) 발송 및 전체적인 UX 폴리싱

**예상 스토리 수**: 2

---

### Epic 6: 구조화 요약 및 신뢰성 강화 (LilysAI 벤치마크 — Phase 2)

**목표**: 단순 TL;DR+본문을 **LilysAI 수준의 구조화·맞춤·출처·보내기** 경험으로 업그레이드

**예상 스토리 수**: 5

**선행 조건**: Epic 2(기본 요약 파이프라인) 완료

#### Story 6.1: 구조화 요약 스키마 및 프롬프트 v2

**As a** 사용자,  
**I want** AI 요약이 목차·섹션·인사이트가 있는 구조로 생성되기를,  
**So that** 긴 콘텐츠도 Lilys처럼 훑어보고 깊게 읽을 수 있다.

**관련 요구사항**: FR006, FR014

**출력 JSON 스키마 (고정)**

```json
{
  "title": "string",
  "insight": "한 문단 핵심 인사이트",
  "tldr": ["string", "string", "string"],
  "tableOfContents": [{ "id": "1", "title": "...", "level": 1 }],
  "sections": [
    {
      "id": "1",
      "heading": "1. 섹션 제목",
      "level": 2,
      "content": "Markdown 본문",
      "citations": [{ "label": "출처 보기", "url": "https://youtube.com/...?t=120" }]
    }
  ]
}
```

**작업 범위**

- `lib/gemini/prompts.ts` — v2 JSON 지시 + length/tone 파라미터
- `types/summary.ts` — `StructuredSummary` 타입
- `summaries.summary_text`에 v2 JSON 저장 (하위 호환: v1 파서 유지)
- DB: `summary_options` JSON 컬럼 (`length`, `tone`)

**수용 기준**

- [ ] 텍스트·YouTube 모두 v2 스키마로 `completed` 저장
- [ ] 파싱 실패 시 `failed` + 명확한 에러

---

#### Story 6.2: 요약 옵션 UI (길이·문체)

**As a** 사용자,  
**I want** 요약 전에 짧게/기본/길게와 쉬운 설명 여부를 선택하기를,  
**So that** Lilys처럼 내 목적에 맞는 요약을 받을 수 있다.

**관련 요구사항**: FR013

| 옵션 | 값 | 프롬프트 효과 |
|------|-----|----------------|
| 길이 | `short` / `default` / `long` | 섹션 수·분량 조절 |
| 문체 | `default` / `easy` | 쉬운 말 설명 vs 전문적 |

**수용 기준**

- [ ] `POST /api/summary` body에 `options: { length, tone }` 전달
- [ ] UI 세그먼트 컨트롤과 API 연동
- [ ] 히스토리에 사용한 옵션 표시(배지)

---

#### Story 6.3: SummaryCard v2 — Insight · TOC · 섹션 본문

**As a** 사용자,  
**I want** 요약 화면에서 목차 클릭으로 섹션 이동과 계층 구조를 보기를,  
**So that** Lilys 예시 화면처럼 스캔 가능한 독서 경험을 한다.

**관련 요구사항**: FR014, UX 원칙(Scannable)

**작업 범위**

- `SummaryInsightHero`, `SummaryToc`, `SummarySections` 컴포넌트 분리
- v1 요약(legacy) fallback 렌더링
- YouTube 메타데이터 헤더 유지

**수용 기준**

- [ ] TOC 클릭 시 해당 섹션으로 스크롤
- [ ] 모바일에서 TOC는 상단 가로 스크롤 또는 드로어

---

#### Story 6.4: 출처(Citation) 표시 — YouTube 타임스탬프

**As a** 사용자,  
**I want** 요약 문장 근처에서 원본 영상 구간으로 이동하기를,  
**So that** Lilys의 "출처 보기"처럼 요약을 신뢰하고 팩트체크할 수 있다.

**관련 요구사항**: FR015

**작업 범위**

- 프롬프트: YouTube 요약 시 `citations[].url`에 `&t=초` 포함 지시 (모델 추정 타임스탬프, Phase 2는 근사치 허용)
- UI: `[출처 보기]` 링크 → 새 탭 YouTube
- 텍스트 요약: `citations` optional 또는 원문 인용 문장 표시

**수용 기준**

- [ ] YouTube 요약 결과에 1개 이상 citation 링크 표시
- [ ] 링크 클릭 시 해당 영상 URL로 이동

**제한 (명시)**

- Gemini가 반환한 타임스탬프는 **근사치**이며, Phase 3에서 transcript 없이 정밀 싱크는 제한적

---

#### Story 6.5: Markdown보내기

**As a** 사용자,  
**I want** 요약 전체를 Markdown 파일로 다운로드하기를,  
**So that** Notion·Obsidian 등 2차 활용이 가능하다 (Lilys보내기 1차 대응).

**관련 요구사항**: FR016

**수용 기준**

- [ ] "Markdown 다운로드" 클릭 시 `.md` 파일 저장 (제목·인사이트·TOC·본문 포함)
- [ ] 클립보드 복사는 v2 전체 구조 유지

---

### Epic 7: 자료 기반 채팅 및 해설 (Phase 3)

**목표**: LilysAI의 **Lily 채팅·원클릭 해설**을 DocuSumm 범위에서 구현 (요약 + 원문 범위 Q&A)

**예상 스토리 수**: 3

**선행 조건**: Epic 3(인증), Epic 6(구조화 요약)

#### Story 7.1: 요약 컨텍스트 Q&A API

- `POST /api/summary/[id]/chat` — `{ message }` → 스트리밍 응답
- 시스템 프롬프트: 해당 요약 JSON + `original_content`만 근거, 모르면 "자료에 없음"
- 크레딧: 메시지당 0.2 크레딧 또는 채팅 묶음 정책 (PRD 확정 필요)

#### Story 7.2: 채팅 UI (드로어)

- 요약 상세 화면 우측 `ChatPanel`, 메시지 히스토리 DB 저장 (`summary_messages` 테이블)

#### Story 7.3: 선택 구간 해설 (Explain)

- 본문 텍스트 선택 → "이 부분 해설" → 짧은 해설 API
- Lilys "해설" 버튼 1차 동등 기능

---

## 제품 로드맵 (요약)

| Phase | Epic | 핵심 deliverable |
|-------|------|------------------|
| 1 | Epic 1~2 | 대시보드 + Gemini 요약 v1 |
| 1 | Epic 3~5 | 인증·결제·이메일 |
| 2 | **Epic 6** | Lilys형 구조화 요약·옵션·출처·MD export |
| 3 | **Epic 7** | 자료 기반 채팅·해설 |
| 4+ | — | 웹 URL, PDF, 채널 구독, 브라우저 확장 (별도 PRD) |

---

## 범위 외 (Out of Scope)

### 현재 버전에서 제외되는 기능

-   **파일 업로드**: 초기 MVP에서는 텍스트 직접 입력과 URL 입력만 지원
-   **모바일 네이티브 앱**: 초기에는 반응형 웹에 집중
-   **YouTube 텍스트 추출 방식**: 자막/caption 추출, yt-dlp, STT(Whisper 등), transcript → LLM 2단계 파이프라인 미사용. `generateContent` + `fileData.fileUri`(YouTube URL) 방식만 사용
-   **레거시 Gemini SDK**: `@google/generative-ai` 미사용 (`@google/genai`만 사용)
-   **커뮤니티 기능**: 다른 사용자의 요약을 보거나 공유하는 소셜 기능 제외
-   **Hwp/Docx 파일 파싱**: 파일 업로드 기능 제외로 인해 불필요
-   **LilysAI Phase 4+ 기능 (당분간)**: PDF/오디오 업로드, RSS·YouTube 채널 구독, 크롬 확장, 30+ 리포트 템플릿, 마인드맵·인포그래픽 자동 생성, AI 메모리·개인화 추천, SOC2 — 로드맵 Epic 8+ 후보로만 기록
-   **정밀 영상 싱크**: 자막/STT 없이 Gemini만으로 초 단위 완벽 타임스탬프 보장 (Phase 2는 근사치 출처)

### 지원하지 않는 플랫폼

-   Internet Explorer 등 레거시 브라우저

### 기술적 제약

-   AI 모델의 토큰 제한(Context Window)을 초과하는 초대용량 텍스트는 지원 불가할 수 있음
-   비공개·일부 제한 YouTube 영상은 요약 불가 (공개 public 영상만 지원)
-   YouTube URL 직접 입력 기능은 Gemini API Preview — 운영 시 요금·Rate limit 변경 가능
