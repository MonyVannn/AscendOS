/**
 * TanStack Form + Standard Schema validators often populate `errors` with
 * `StandardSchemaV1Issue` objects; normalize them for UI text.
 */
export function validationMessageFromUnknown(
  err: unknown,
): string | undefined {
  if (err == null) return undefined;
  if (typeof err === "string") return err;
  if (typeof err === "object" && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  if (Array.isArray(err)) {
    for (const item of err) {
      const line = validationMessageFromUnknown(item);
      if (line) return line;
    }
    return undefined;
  }
  return undefined;
}

export function firstValidationMessage(errors: readonly unknown[]): string | undefined {
  const first = errors[0];
  return validationMessageFromUnknown(first);
}

export function slugifyNameToSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
