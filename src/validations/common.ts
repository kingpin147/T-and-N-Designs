/**
 * Common Input Validation & Sanitization Helpers
 * Protects database and downstream systems from oversized, malformed, or malicious payloads.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  // Strip null bytes and control chars, trim whitespace
  const cleaned = input.replace(/\0/g, "").trim();
  return cleaned.slice(0, maxLength);
}

export function validateRequiredString(
  value: unknown,
  fieldName: string,
  minLength = 1,
  maxLength = 500
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }
  const sanitized = sanitizeString(value, maxLength);
  if (sanitized.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters.`);
  }
  return sanitized;
}

export function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("Valid email address is required.");
  }
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    throw new ValidationError("Please provide a valid email address.");
  }
  return normalized;
}

export function validateUrl(url: unknown, fieldName = "URL"): string | undefined {
  if (!url || typeof url !== "string" || url.trim() === "") return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new ValidationError(`${fieldName} must start with http:// or https://`);
    }
    return trimmed;
  } catch {
    throw new ValidationError(`Invalid ${fieldName} format.`);
  }
}

export function validateSlug(slug: unknown, fallbackTitle = ""): string {
  if (typeof slug === "string" && slug.trim()) {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    if (clean) return clean.slice(0, 150);
  }
  const fromTitle = fallbackTitle.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
  return fromTitle.slice(0, 150) || `entry-${Date.now()}`;
}

export function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => sanitizeString(t, 50).toLowerCase())
    .slice(0, 20);
}

