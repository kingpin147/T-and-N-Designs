import bcrypt from "bcryptjs";
import { validateInviteInput } from "@/validations/user.validator";
import {
  findAllTeamMembers,
  findUserByEmail,
  createTeamMember,
  updateTeamMemberRole,
  deleteTeamMember,
} from "@/repositories/user.repository";
import { sendEmail } from "@/lib/brevo";
import { ValidationError } from "@/validations/common";

export async function listTeamMembers() {
  return findAllTeamMembers();
}

export async function inviteNewTeamMember(rawPayload: unknown) {
  const cleanInput = validateInviteInput(rawPayload);

  // Check existence
  const existing = await findUserByEmail(cleanInput.email);
  if (existing) {
    throw new ValidationError("A user with this email already exists.");
  }

  const tempPassword = `Tnn${Math.floor(100000 + Math.random() * 900000)}!`;
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newRecord = await createTeamMember(
    cleanInput.name,
    cleanInput.email,
    cleanInput.role,
    hashedPassword,
    cleanInput.permissions
  );

  // Send onboarding email with timeout protection
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.tnndesigns.com";
  try {
    await sendEmail({
      toEmail: cleanInput.email,
      toName: cleanInput.name,
      subject: "You've been invited to T & N Designs Agency Portal",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #123968;">Welcome to T &amp; N Designs Portal</h2>
          <p>Hello ${cleanInput.name},</p>
          <p>You have been assigned the <strong>${cleanInput.role}</strong> role on our digital management platform.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Login URL:</strong> <a href="${appUrl}/admin/login">${appUrl}/admin/login</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Username:</strong> ${cleanInput.email}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">Please change your password after your first login.</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.warn("⚠️ [User Service] Invite email dispatch warning (non-fatal):", emailErr);
  }

  return {
    userId: newRecord.id,
    email: cleanInput.email,
    role: cleanInput.role,
    tempPassword,
    message: `Invitation generated for ${cleanInput.email}`,
  };
}

export async function modifyTeamMember(rawPayload: unknown) {
  if (!rawPayload || typeof rawPayload !== "object") {
    throw new ValidationError("Invalid payload.");
  }
  const data = rawPayload as Record<string, unknown>;
  const email = String(data.email || "").trim().toLowerCase();
  const role = String(data.role || "writer").trim();
  const permissions = data.permissions as any;

  if (!email || !role) {
    throw new ValidationError("Email and role are required.");
  }

  await updateTeamMemberRole(email, role, permissions);
  return { updatedEmail: email };
}

export async function removeTeamMember(email: string) {
  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required for deletion.");
  }
  await deleteTeamMember(email.trim().toLowerCase());
  return { deletedEmail: email };
}

