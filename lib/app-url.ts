/** Vercel 배포 시 자동 주입 (프로토콜 없음) */
function getVercelDeploymentBaseUrl(): string | null {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    return production.startsWith("http")
      ? production.replace(/\/$/, "")
      : `https://${production.replace(/\/$/, "")}`;
  }

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) {
    return `https://${deployment.replace(/\/$/, "")}`;
  }

  return null;
}

function isLocalhostHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h.startsWith("localhost:");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const withProto = url.startsWith("http") ? url : `http://${url}`;
    return isLocalhostHost(new URL(withProto).hostname);
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

/** Request 헤더에서 공개 origin (Vercel/프록시·로컬 dev 대응) */
export function getRequestOrigin(headers: Headers): string | null {
  const host =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headers.get("host")?.split(",")[0]?.trim();
  if (!host) return null;

  const hostname = host.split(":")[0];
  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (isLocalhostHost(hostname) ? "http" : "https");
  return `${proto}://${host}`;
}

/** OAuth·로그인 오류 안내용 콜백 URL */
export function getAuthCallbackUrl(headers?: Headers): string {
  if (headers) {
    const origin = getRequestOrigin(headers);
    if (origin) return `${origin}/auth/callback`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && !isLocalhostUrl(site)) {
    return site.replace(/\/$/, "");
  }

  const vercel = getVercelDeploymentBaseUrl();
  if (vercel) return `${vercel}/auth/callback`;

  if (site) return site.replace(/\/$/, "");

  return "http://localhost:3002/auth/callback";
}

/** 이메일·결제 리다이렉트 등에 쓰는 공개 앱 베이스 URL */
export function getAppBaseUrl(headers?: Headers): string {
  if (headers) {
    const origin = getRequestOrigin(headers);
    if (origin) return origin;
  }

  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit && !isLocalhostUrl(explicit)) {
    return explicit.replace(/\/$/, "");
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && !isLocalhostUrl(site)) {
    return site.replace(/\/auth\/callback\/?$/, "").replace(/\/$/, "");
  }

  const vercel = getVercelDeploymentBaseUrl();
  if (vercel) return vercel;

  if (explicit) return explicit.replace(/\/$/, "");
  if (site) {
    return site.replace(/\/auth\/callback\/?$/, "").replace(/\/$/, "");
  }

  return "http://localhost:3002";
}

export function dashboardSummaryUrl(summaryId: string): string {
  const base = getAppBaseUrl();
  return `${base}/dashboard?summary=${encodeURIComponent(summaryId)}`;
}
