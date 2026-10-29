import { Inquiry } from "@/types";
import { safeFetch } from "@/lib/http-client";

interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "contact@tnndesigns.com";
  const senderName = process.env.BREVO_SENDER_NAME || "T & N Designs";

  if (!apiKey || apiKey.includes("YOUR_BREVO_API_KEY")) {
    console.warn("⚠️ [Brevo] BREVO_API_KEY is not configured. Email logged to console instead.");
    console.log(`[Brevo Mock] To: ${toEmail} | Subject: ${subject}`);
    return { success: true, messageId: "mock-id-dev-mode" };
  }

  try {
    // Protected by safeFetch with 8-second timeout
    const response = await safeFetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      timeoutMs: 8000,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
        replyTo: replyTo ? { email: replyTo.email, name: replyTo.name || replyTo.email } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [Brevo API Error]", response.status, errorData);
      return { success: false, error: "Email delivery service reported an issue." };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [Brevo Send Exception]", errorMsg);
    return { success: false, error: "Failed to dispatch email due to connection timeout or network issue." };
  }
}

/**
 * Sends both Admin notification and Client acknowledgment emails upon lead submission
 */
export async function sendInquiryEmails(inquiry: Inquiry) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "contact@tnndesigns.com";

  // 1. Admin Email Template
  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f3f4f6; padding: 32px; border-radius: 12px; border: 1px solid #1f2430;">
      <div style="border-bottom: 1px solid #2a3142; padding-bottom: 20px; margin-bottom: 24px;">
        <span style="background: #3b82f6; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">New Lead Captured</span>
        <h2 style="margin: 12px 0 0 0; color: #ffffff; font-size: 22px;">High-Intent Inquiry Received</h2>
        <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 14px;">Submitted via T &amp; N Designs Website Contact Form</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; color: #9ca3af; width: 140px;">Client Name:</td>
          <td style="padding: 10px 0; color: #ffffff; font-weight: 600;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #9ca3af;">Email:</td>
          <td style="padding: 10px 0;"><a href="mailto:${inquiry.email}" style="color: #60a5fa; text-decoration: none;">${inquiry.email}</a></td>
        </tr>
        ${inquiry.phone ? `<tr><td style="padding: 10px 0; color: #9ca3af;">Phone:</td><td style="padding: 10px 0; color: #ffffff;">${inquiry.phone}</td></tr>` : ''}
        ${inquiry.company ? `<tr><td style="padding: 10px 0; color: #9ca3af;">Company:</td><td style="padding: 10px 0; color: #ffffff;">${inquiry.company}</td></tr>` : ''}
        <tr>
          <td style="padding: 10px 0; color: #9ca3af;">Project Type:</td>
          <td style="padding: 10px 0; color: #10b981; font-weight: 600;">${inquiry.projectType}</td>
        </tr>
        ${inquiry.budgetRange ? `<tr><td style="padding: 10px 0; color: #9ca3af;">Budget:</td><td style="padding: 10px 0; color: #f59e0b; font-weight: 600;">${inquiry.budgetRange}</td></tr>` : ''}
        ${inquiry.timeline ? `<tr><td style="padding: 10px 0; color: #9ca3af;">Target Timeline:</td><td style="padding: 10px 0; color: #ffffff;">${inquiry.timeline}</td></tr>` : ''}
      </table>

      <div style="background: #141824; padding: 18px; border-radius: 8px; border-left: 3px solid #3b82f6; margin-bottom: 24px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; font-weight: 700;">Project Scope / Message</p>
        <p style="margin: 0; color: #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
      </div>

      <div style="text-align: center; padding-top: 12px;">
        <a href="mailto:${inquiry.email}?subject=Regarding%20your%20project%20inquiry%20with%20T%20%26%20N%20Designs" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 8px; font-size: 14px;">Reply Directly to ${inquiry.name}</a>
      </div>
    </div>
  `;

  // 2. Client Confirmation Template
  const clientHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f3f4f6; padding: 32px; border-radius: 12px; border: 1px solid #1f2430;">
      <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #2a3142;">
        <h1 style="margin: 0; font-size: 26px; color: #ffffff; letter-spacing: -0.02em;">T & N Designs</h1>
        <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 13px;">Custom Web Applications & Elite Digital Craftsmanship</p>
      </div>

      <div style="padding: 24px 0;">
        <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px 0;">Thank you, ${inquiry.name}!</h2>
        <p style="color: #d1d5db; line-height: 1.6; font-size: 15px; margin: 0 0 16px 0;">
          We have received your project details for <strong>${inquiry.projectType}</strong>. Our senior design and engineering leads are currently reviewing your project scope.
        </p>
        <p style="color: #d1d5db; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
          ⚡ <strong>Expected turnaround:</strong> We personally analyze every inquiry and will respond within <strong>2–4 business hours</strong> with initial recommendations and availability.
        </p>

        <div style="background: #141824; padding: 20px; border-radius: 8px; border: 1px solid #222938; margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">Summary of Your Submission:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 13px; line-height: 1.8;">
            <li>Service: <strong style="color: #ffffff;">${inquiry.projectType}</strong></li>
            ${inquiry.budgetRange ? `<li>Estimated Budget: <strong style="color: #ffffff;">${inquiry.budgetRange}</strong></li>` : ''}
            ${inquiry.timeline ? `<li>Timeline: <strong style="color: #ffffff;">${inquiry.timeline}</strong></li>` : ''}
          </ul>
        </div>

        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
          Direct Inquiries: <strong>contact@tnndesigns.com</strong><br/>
          Studio Location: <strong>Lahore, Pakistan</strong>
        </p>
      </div>

      <div style="border-top: 1px solid #2a3142; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        © 2026 T & N Designs. All rights reserved.
      </div>
    </div>
  `;

  const [adminResult, clientResult] = await Promise.all([
    sendEmail({
      toEmail: adminEmail,
      toName: "T & N Designs Admin",
      subject: `🚨 [New Lead] ${inquiry.name} (${inquiry.projectType}${inquiry.budgetRange ? ` · ${inquiry.budgetRange}` : ""})`,
      htmlContent: adminHtml,
      replyTo: { email: inquiry.email, name: inquiry.name },
    }),
    sendEmail({
      toEmail: inquiry.email,
      toName: inquiry.name,
      subject: `Your Project Inquiry with T & N Designs [Received]`,
      htmlContent: clientHtml,
    }),
  ]);

  return { adminResult, clientResult };
}
