import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "RESEND_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.",
    );
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "DocuSumm <onboarding@resend.dev>"
  );
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
