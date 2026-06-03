# 로컬 결제 후 크레딧 미충전 — 점검 순서

결제(Checkout)는 성공했는데 크레딧이 안 오르면, **대부분 웹훅이 앱에 도달하지 않았거나** DB/시크릿 설정 문제입니다.

## 0. 결제 성공 페이지 자동 충전 (권장)

`/billing?success=1&session_id=cs_...` 로 돌아오면 앱이 **`POST /api/payment/confirm`** 으로 Stripe 세션을 조회해 충전합니다.  
**`stripe listen` 없이도** 로컬에서 충전 테스트가 가능합니다 (차감과 동일하게 `users.credits` 갱신).

웹훅은 프로덕션·중복 방지용으로 계속 두는 것을 권장합니다.

## 1. Stripe CLI 포워딩 (필수)

로컬 개발 중에는 Dashboard Webhook이 아니라 **CLI**로 이벤트를 받습니다.

```powershell
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

- `pnpm dev` 포트와 **동일**해야 합니다 (예: 3002).
- 터미널에 표시되는 `whsec_...` 를 `.env.local`의 **`STRIPE_WEBHOOK_SECRET`**에 넣고 **dev 서버 재시작**.

Dashboard에 등록한 `whsec`와 CLI `whsec`는 **서로 다릅니다**. `stripe listen`을 쓰는 동안에는 CLI 값만 사용하세요.

## 2. DB 마이그레이션

```powershell
pnpm db:push
```

`credit_transactions` 테이블이 없으면 웹훅 핸들러가 **500**을 반환합니다. `stripe listen` 터미널에 `500` 또는 `handler error`가 보이는지 확인하세요.

## 3. 결제 직후 로그 확인

`pnpm dev` 터미널에서 다음 중 하나를 찾습니다.

| 로그 | 의미 |
|------|------|
| `[stripe webhook] credits applied` | 정상 충전 |
| `[stripe webhook] signature failed` | `STRIPE_WEBHOOK_SECRET` 불일치 |
| `[stripe webhook] skipped charge` + `reason` | 메타데이터/결제 상태 문제 (코드 수정으로 완화됨) |
| `[stripe webhook] handler error` | DB·유저 없음 등 |

## 4. 이미 결제만 하고 listen이 꺼져 있었던 경우

1. `stripe listen --forward-to localhost:3002/api/webhooks/stripe` 실행
2. [Stripe Dashboard → Developers → Events](https://dashboard.stripe.com/test/events)에서 해당 `checkout.session.completed` 이벤트 **Replay** (또는 CLI `stripe events resend evt_...`)

## 5. Supabase에서 확인

- `users.credits` 증가 여부
- `credit_transactions`에 `type = charge` 행 생성 여부
