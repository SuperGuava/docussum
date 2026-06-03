# DocuSumm — Stripe Test Mode 카탈로그

상품·가격은 **Stripe MCP** (`https://mcp.stripe.com`, 프로젝트 `.cursor/mcp.json`)로 등록한다. Dashboard 수동 생성은 사용하지 않는다.

| 등록일 | 도구 | 모드 |
|--------|------|------|
| 2026-06-03 | `create_product`, `create_price` | Test (`livemode: false`) |

## 패키지 매핑

| packageId | 크레딧 | USD | Product ID | Price ID |
|-----------|--------|-----|------------|----------|
| `credits_30` | 30 | $5.00 | `prod_UdVJGDPebGZxwH` | `price_1TeEJPIYzHZbjIp3QDStclbH` |
| `credits_50` | 50 | $8.00 | `prod_UdVJogFViJdPTC` | `price_1TeEJPIYzHZbjIp3V09fcDu2` |
| `credits_100` | 100 | $15.00 | `prod_UdVJZ17qkdFSH7` | `price_1TeEJPIYzHZbjIp3hJCN0Spv` |

모든 Price는 **one_time** (`recurring: null`).

## `.env.local` 예시

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_30=price_1TeEJPIYzHZbjIp3QDStclbH
STRIPE_PRICE_ID_50=price_1TeEJPIYzHZbjIp3V09fcDu2
STRIPE_PRICE_ID_100=price_1TeEJPIYzHZbjIp3hJCN0Spv
```

## MCP로 재등록·조회

1. Cursor에서 Stripe MCP 인증: `mcp_auth` (최초 1회 OAuth).
2. 기존 카탈로그 확인: `search_stripe_resources` — `products:name~"DocuSumm"`.
3. 신규 패키지: `create_product` → `create_price` (금액은 **센트** 단위, 예: $5 → `500`).
4. Price 목록: `search_stripe_resources` — `prices:product:'prod_...'`.

Production(Live) 전환 시 동일 MCP 도구로 Live 모드 계정에 별도 Product/Price를 만들고 env를 Live Price ID로 교체한다.
