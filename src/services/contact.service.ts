import { validateContactSubmission } from "@/validations/contact.validator";
import { createInquiry } from "@/repositories/inquiry.repository";
import { sendInquiryEmails } from "@/lib/brevo";

export async function processContactInquiry(rawPayload: unknown) {
  // 1. Layer 1: Strict Input Validation & Sanitization
  const cleanInquiry = validateContactSubmission(rawPayload);

  // 2. Layer 2: Save to Data Access Layer
  const dbRecord = await createInquiry(cleanInquiry);

  // 3. Layer 3: Dispatch Dual Notification & Acknowledgment Emails (timeout-protected)
  let emailSent = false;
  try {
    const emailResult = await sendInquiryEmails(cleanInquiry);
    emailSent = emailResult.adminResult.success;
  } catch (emailErr) {
    console.warn("⚠️ [Contact Service] Brevo email dispatch warning (non-fatal):", emailErr);
  }

  return {
    inquiryId: dbRecord.id,
    emailSent,
    clientName: cleanInquiry.name,
  };
}

