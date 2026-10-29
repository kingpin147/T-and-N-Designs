import { NextRequest } from "next/server";
import {
  listTeamMembers,
  modifyTeamMember,
  removeTeamMember,
} from "@/services/user.service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return apiError("Unauthorized. Admin access required.", 403);
    }

    const users = await listTeamMembers();
    return apiSuccess({ users });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to load team members.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return apiError("Unauthorized. Admin access required.", 403);
    }

    const body = await req.json();
    const result = await modifyTeamMember(body);

    return apiSuccess({ message: "Team member updated successfully.", ...result });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to update team member permissions.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return apiError("Unauthorized. Admin access required.", 403);
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return apiError("Email parameter is required.", 400);
    }

    if (email.toLowerCase() === currentUser.email.toLowerCase()) {
      return apiError("You cannot delete your own admin account.", 400);
    }

    await removeTeamMember(email);
    return apiSuccess({ message: `Access revoked for ${email}.` });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to delete team member.");
  }
}
