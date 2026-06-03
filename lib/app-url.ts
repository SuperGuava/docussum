/** 이메일·결제 리다이렉트 등에 쓰는 공개 앱 베이스 URL */
export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    return site.replace(/\/auth\/callback\/?$/, "").replace(/\/$/, "");
  }

  return "http://localhost:3002";
}

export function dashboardSummaryUrl(summaryId: string): string {
  const base = getAppBaseUrl();
  return `${base}/dashboard?summary=${encodeURIComponent(summaryId)}`;
}
