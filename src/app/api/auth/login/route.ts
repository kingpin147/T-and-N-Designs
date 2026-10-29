import { NextRequest, NextResponse } from "next/server";
import { authenticateWithNeon, createSessionToken } from "@/lib/auth";
import { validateLoginInput } from "@/validations/user.validator";
import { apiError, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { email, password } = validateLoginInput(rawBody);

    const user = await authenticateWithNeon(email, password);
    if (!user) {
      return apiError("Invalid email or password. Please try again.", 401);
    }

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });

    response.cookies.set("tnn_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    return handleApiError(err, "Authentication failed. Please check your credentials.");
  }
}
