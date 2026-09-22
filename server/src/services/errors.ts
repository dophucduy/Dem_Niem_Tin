import type { ApiErrorCode } from "@dem-niem-tin/shared";

export class ServiceError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
