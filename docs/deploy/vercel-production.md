# Vercel 프로덕션 배포 (DocuSumm)

프로덕션 URL: **https://docussum-orcin.vercel.app**

## 1. Vercel 환경 변수 (Production)

Vercel → Project **docussum** → **Settings** → **Environment Variables**

`.env.local`을 그대로 복사하지 말고, **Production**에 아래를 설정합니다.

| 변수 | Production 값 |
|------|----------------|
| `NEXT_PUBLIC_APP_URL` | `https://docussum-orcin.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://docussum-orcin.vercel.app/auth/callback` |
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabase Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon JWT) |
| `DATABASE_URL` | (Supabase Postgres URI) |
| `GEMINI_API_KEY` | (Google AI Studio) |
| `STRIPE_SECRET_KEY` | `sk_test_...` 또는 live |
| `STRIPE_WEBHOOK_SECRET` | Vercel용 웹훅 signing secret |
| `STRIPE_PRICE_ID_*` | Stripe Price ID |
| `RESEND_API_KEY` | (선택) |

`NEXT_PUBLIC_*` 변경 후 **반드시 Redeploy** (빌드 시 번들에 반영됨).

## 2. Supabase — Google OAuth URL

[Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**

### Redirect URLs (둘 다 추가)

```
http://localhost:3002/auth/callback
https://docussum-orcin.vercel.app/auth/callback
```

### Site URL

프로덕션 기준:

```
https://docussum-orcin.vercel.app
```

로컬 개발만 할 때는 Site URL을 `http://localhost:3002`로 두고, Redirect URLs에 프로덕션 URL을 유지해도 됩니다.  
**Site URL이 localhost만이면 OAuth 후 localhost로 돌아갈 수 있습니다.**

## 3. Google Cloud Console

**APIs & Services** → **Credentials** → OAuth 2.0 Client

**Authorized redirect URIs** (Supabase 콜백):

```
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

Supabase → **Authentication** → **Providers** → **Google** 활성화 및 Client ID/Secret 일치 확인.

## 4. Stripe (프로덕션 결제)

1. Stripe Dashboard → **Developers** → **Webhooks** → Add endpoint  
   - URL: `https://docussum-orcin.vercel.app/api/webhooks/stripe`  
   - Events: `checkout.session.completed` 등 (로컬과 동일)
2. Signing secret → Vercel `STRIPE_WEBHOOK_SECRET` (Production)
3. Checkout 성공/취소 URL은 요청 `Origin` 기준으로 동작 (`app/api/payment/checkout`)

## 5. 배포 확인

1. Vercel 최신 배포 **Ready**
2. https://docussum-orcin.vercel.app/login → Google 로그인
3. 주소창: `.../auth/callback?code=...` → `/dashboard`
4. 실패 시 로그인 페이지 오류 메시지의 **Redirect URL**을 Supabase에 그대로 등록

## 6. 커스텀 도메인 연결 시

1. Vercel에 도메인 추가
2. Supabase Redirect URLs + Site URL에 `https://<custom-domain>` 추가
3. `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` 갱신 후 Redeploy
