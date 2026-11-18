import { NextRequest } from "next/server";
import {
  getAllInquiries,
  createInquiry,
  updateInquiryStatus,
  deleteInquiryById,
} from "@/repositories/inquiry.repository";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeString } from "@/validations/common";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageLeads && currentUser.role !== "admin")) {
      return apiError("Unauthorized to view inquiries.", 403);
    }

    const inquiries = await getAllInquiries();
    return apiSuccess({ inquiries });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to load CRM lead inquiries.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageLeads && currentUser.role !== "admin")) {
      return apiError("Unauthorized to create inquiries.", 403);
    }

    const body = await req.json();
    const name = sanitizeString(body.name, 255) || "Lead Prospect";
    const email = sanitizeString(body.email, 255) || "prospect@lead.local";
    const phone = sanitizeString(body.phone, 50);
    const company = sanitizeString(body.company, 255);
    const projectType = sanitizeString(body.projectType, 100) || "Website Redesign & Modernization";
    const budgetRange = sanitizeString(body.budgetRange, 100) || "To Be Estimated";
    const timeline = sanitizeString(body.timeline, 100) || "Immediate";
    const message = sanitizeString(body.message, 3000) || "Discovered via OpenStreetMap Lead Finder.";
    const sourceUrl = sanitizeString(body.sourceUrl, 500);

    const result = await createInquiry({
      id: "",
      name,
      email,
      phone,
      company,
      projectType,
      budgetRange,
      timeline,
      message,
      sourceUrl,
      status: "new",
      createdAt: new Date().toISOString(),
    });

    return apiSuccess({ id: result.id, message: "Prospect saved to Neon CRM successfully." });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to save inquiry to CRM.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageLeads && currentUser.role !== "admin")) {
      return apiError("Unauthorized to update inquiries.", 403);
    }

    const body = await req.json();
    const id = sanitizeString(body.id, 100);
    const status = sanitizeString(body.status, 50);

    if (!id || !status) {
      return apiError("Inquiry ID and new status are required.", 400);
    }

    const allowedStatuses = ["new", "contacted", "in_progress", "qualified", "closed"];
    if (!allowedStatuses.includes(status)) {
      return apiError(`Invalid status. Must be one of: ${allowedStatuses.join(", ")}`, 400);
    }

    await updateInquiryStatus(id, status);
    return apiSuccess({ message: `Inquiry status updated to ${status}.` });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to update inquiry status.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageLeads && currentUser.role !== "admin")) {
      return apiError("Unauthorized to delete inquiries.", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError("Inquiry ID parameter is required.", 400);
    }

    await deleteInquiryById(id.trim());
    return apiSuccess({ message: "Inquiry removed from CRM." });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to delete inquiry.");
  }
}
