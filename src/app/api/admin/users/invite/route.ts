import { NextRequest } from "next/server";
import { inviteNewTeamMember } from "@/services/user.service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return apiError("Unauthorized. Admin access required.", 403);
    }

    const body = await req.json();
    const result = await inviteNewTeamMember(body);

    return apiSuccess({
      message: result.message,
      userId: result.userId,
      email: result.email,
      role: result.role,
      tempPassword: result.tempPassword,
    }, 201);
  } catch (err: unknown) {
    return handleApiError(err, "Failed to invite team member. Please verify the email and role.");
  }
}
