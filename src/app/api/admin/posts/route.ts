import { NextRequest } from "next/server";
import {
  listAllPosts,
  createNewPost,
  editPost,
  removePost,
} from "@/services/post.service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await listAllPosts();
    return apiSuccess({ posts });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to retrieve blog articles.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageBlog && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage blog articles", 403);
    }

    const body = await req.json();
    const created = await createNewPost(body);

    return apiSuccess({ post: created, message: "Blog article published successfully." }, 201);
  } catch (err: unknown) {
    return handleApiError(err, "Failed to publish blog article. Please check inputs.");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageBlog && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage blog articles", 403);
    }

    const body = await req.json();
    const updated = await editPost(body);

    return apiSuccess({ message: "Blog article updated successfully.", ...updated });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to update blog article.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageBlog && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage blog articles", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError("Article ID parameter is required.", 400);
    }

    await removePost(id);
    return apiSuccess({ message: "Article deleted successfully." });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to delete article.");
  }
}
