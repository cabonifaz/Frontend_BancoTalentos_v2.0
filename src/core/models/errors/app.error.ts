type ErrorReason = "VALIDATION" | "NETWORK" | "AUTH" | "UNKNOWN";

export class AppError extends Error {
  readonly reason?: ErrorReason;
  readonly code?: string;

  constructor(message: string, reason?: ErrorReason, code?: string) {
    super(message);
    this.name = "AppError";
    this.reason = reason;
    this.code = code;
  }
}
