import type { AckFailure, ApiErrorCode } from "@dem-niem-tin/shared";
import type { ZodError } from "zod";

export function failure(code: ApiErrorCode, message: string): AckFailure {
  return { ok: false, error: { code, message } };
}

export function validationFailure(error: ZodError): AckFailure {
  const fieldErrors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]),
    ),
  );
  return {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Payload validation failed",
      fieldErrors,
    },
  };
}
