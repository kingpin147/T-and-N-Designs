import { Inquiry } from "@/types";
import {
  ValidationError,
  validateEmail,
  validateRequiredString,
  sanitizeString,
} from "./common";

export interface ValidatedContactInput extends Inquiry {
  sourceUrl?: string;
}

export function validateContactSubmission(body: unknown): ValidatedContactInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body. Expected JSON object.");
  }

  const data = body as Record<string, unknown>;

  const name = validateRequiredString(data.name, "Your name", 2, 100);
  const email = validateEmail(data.email);
  const message = validateRequiredString(data.message, "Project scope / message", 5, 5000);

  const phone = data.phone ? sanitizeString(data.phone, 30) : undefined;
  const company = data.company ? sanitizeString(data.company, 100) : undefined;
  const projectType = data.projectType ? sanitizeString(data.projectType, 100) : "Custom Web Application";
  const budgetRange = data.budgetRange ? sanitizeString(data.budgetRange, 50) : undefined;
  const timeline = data.timeline ? sanitizeString(data.timeline, 50) : undefined;
  const sourceUrl = data.sourceUrl ? sanitizeString(data.sourceUrl, 500) : undefined;

  return {
    name,
    email,
    phone,
    company,
    projectType,
    budgetRange,
    timeline,
    message,
    sourceUrl,
    createdAt: new Date().toISOString(),
  };
}

