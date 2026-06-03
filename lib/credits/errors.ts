export class InsufficientCreditsError extends Error {
  readonly code = "INSUFFICIENT_CREDITS" as const;
  readonly credits: number;

  constructor(credits = 0) {
    super("크레딧이 부족합니다.");
    this.name = "InsufficientCreditsError";
    this.credits = credits;
  }
}
