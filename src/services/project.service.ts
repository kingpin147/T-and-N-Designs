import { validateProjectInput } from "@/validations/project.validator";
import {
  findAllProjects,
  insertProject,
  updateProject,
  deleteProjectById,
} from "@/repositories/project.repository";
import { revalidateProjectsCache } from "@/lib/db";

export async function listAllProjects() {
  return findAllProjects();
}

export async function createNewProject(rawPayload: unknown) {
  const cleanData = validateProjectInput(rawPayload, false);
  const created = await insertProject(cleanData);
  revalidateProjectsCache();
  return created;
}

export async function editProject(rawPayload: unknown) {
  const cleanData = validateProjectInput(rawPayload, true);
  await updateProject(cleanData);
  revalidateProjectsCache();
  return { updatedId: cleanData.id };
}

export async function removeProject(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid project ID is required for deletion.");
  }
  await deleteProjectById(id.trim());
  revalidateProjectsCache();
  return { deletedId: id };
}

