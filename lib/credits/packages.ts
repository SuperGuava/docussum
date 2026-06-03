export const CREDIT_PACKAGES = [
  {
    id: "credits_30",
    credits: 30,
    label: "30회",
    priceUsd: 5,
    priceEnvKey: "STRIPE_PRICE_ID_30",
  },
  {
    id: "credits_50",
    credits: 50,
    label: "50회",
    priceUsd: 8,
    priceEnvKey: "STRIPE_PRICE_ID_50",
  },
  {
    id: "credits_100",
    credits: 100,
    label: "100회",
    priceUsd: 15,
    priceEnvKey: "STRIPE_PRICE_ID_100",
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

/** Webhook 등 — Price env 없이 패키지 정의만 검증 */
export function findCreditPackageById(
  packageId: string,
): (typeof CREDIT_PACKAGES)[number] | null {
  return CREDIT_PACKAGES.find((p) => p.id === packageId) ?? null;
}

export type ResolvedCreditPackage = (typeof CREDIT_PACKAGES)[number] & {
  stripePriceId: string;
};

export function resolveCreditPackage(
  packageId: string,
): ResolvedCreditPackage | null {
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return null;

  const stripePriceId = process.env[pkg.priceEnvKey]?.trim();
  if (!stripePriceId) return null;

  return { ...pkg, stripePriceId };
}

export function listResolvablePackages(): ResolvedCreditPackage[] {
  return CREDIT_PACKAGES.map((pkg) => resolveCreditPackage(pkg.id)).filter(
    (p): p is ResolvedCreditPackage => p !== null,
  );
}
