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

  // 1. Invisible Honeypot Trap (Automated bots fill this; humans never see it)
  if (data.b_url_trap || data.fax_trap || data.website_url) {
    throw new ValidationError("Automated bot submission detected.");
  }

  // 2. Interactive Human Verification Checkbox requirement
  if (data.humanVerified !== true) {
    throw new ValidationError("Please check the 'I am not a robot' verification box.");
  }

  // 3. Time-to-Submit Protection (Bots submit in < 2 seconds)
  const duration = Number(data.submissionDurationMs || 0);
  if (duration > 0 && duration < 1800) {
    throw new ValidationError("Submission completed too fast. Please take a moment to review.");
  }

  // 4. Validate Core Fields
  const name = validateRequiredString(data.name, "Your name", 2, 100);
  const email = validateEmail(data.email);
  const message = validateRequiredString(data.message, "Project scope / message", 5, 5000);

  // 5. Anti-Bot Pattern Filter: Message consists purely of phone numbers / digits
  const cleanMsg = message.trim();
  if (/^\+?[\d\s\-\(\)\.]{7,25}$/.test(cleanMsg)) {
    throw new ValidationError("Please describe your project scope and goals in the message.");
  }

  // 6. Anti-Bot Pattern Filter: Dot-spammed disposable email addresses (e.g. e.o.a.b.e.f.o.x...)
  const [localPart] = email.split("@");
  const dotCount = (localPart.match(/\./g) || []).length;
  if (dotCount >= 4 && localPart.length / dotCount < 3.8) {
    throw new ValidationError("Please provide a valid, non-disposable email address.");
  }

  // 7. Anti-Bot Pattern Filter: Gibberish single-word random mixed-case name (e.g. nVUIBPnlluh...)
  if (!name.includes(" ") && name.length > 15 && (name.match(/[A-Z]/g) || []).length >= 4) {
    throw new ValidationError("Please provide a valid full name.");
  }

  const phone = data.phone ? sanitizeString(data.phone, 30) : undefined;
  const company = data.company ? sanitizeString(data.company, 100) : undefined;
  const projectType = data.projectType ? sanitizeString(data.projectType, 100) : "Custom Web Application";
  const budgetRange = data.budgetRange ? sanitizeString(data.budgetRange, 50) : undefined;
  const timeline = data.timeline ? sanitizeString(data.timeline, 50) : undefined;
  const sourceUrl = data.sourceUrl ? sanitizeString(data.sourceUrl, 500) : undefined;
  const location = data.location ? sanitizeString(data.location, 150) : undefined;
  const ipAddress = data.ipAddress ? sanitizeString(data.ipAddress, 50) : undefined;

  return {
    name,
    email,
    phone,
    company,
    projectType,
    budgetRange,
    timeline,
    message,
    location,
    ipAddress,
    sourceUrl,
    createdAt: new Date().toISOString(),
  };
}

