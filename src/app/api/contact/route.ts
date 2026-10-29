import { NextRequest } from "next/server";
import { processContactInquiry } from "@/services/contact.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

/**
 * Contact & Lead Capture Controller
 * Layered architecture: extracts request payload, delegates to service, returns standardized response.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const result = await processContactInquiry(rawBody);

    return apiSuccess({
      message: "Thank you for reaching out! We will review your project and get back to you shortly.",
      inquiryId: result.inquiryId,
      emailDispatched: result.emailSent,
    });
  } catch (err: unknown) {
    return handleApiError(err, "We were unable to submit your message at this time. Please try again or email us directly.");
  }
}
