import { NextRequest } from "next/server";
import {
  listAllProjects,
  createNewProject,
  editProject,
  removeProject,
} from "@/services/project.service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const projects = await listAllProjects();
    return apiSuccess({ projects });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to retrieve portfolio projects.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageProjects && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage projects", 403);
    }

    const body = await req.json();
    const created = await createNewProject(body);

    return apiSuccess({ project: created, message: "Project created successfully." }, 201);
  } catch (err: unknown) {
    return handleApiError(err, "Failed to create project. Please verify inputs.");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageProjects && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage projects", 403);
    }

    const body = await req.json();
    const updated = await editProject(body);

    return apiSuccess({ message: "Project updated successfully.", ...updated });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to update project.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageProjects && currentUser.role !== "admin")) {
      return apiError("Unauthorized to manage projects", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError("Project ID parameter is required.", 400);
    }

    await removeProject(id);
    return apiSuccess({ message: "Project deleted successfully." });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to delete project.");
  }
}
