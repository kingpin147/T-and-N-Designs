import { validatePostInput } from "@/validations/post.validator";
import {
  findAllPosts,
  insertPost,
  updatePost,
  deletePostById,
  publishPostImmediately,
} from "@/repositories/post.repository";
import { revalidatePostsCache } from "@/lib/db";

export async function listAllPosts(fresh = false, includeAll = false) {
  return findAllPosts(fresh, includeAll);
}

export async function createNewPost(rawPayload: unknown) {
  const cleanData = validatePostInput(rawPayload, false);
  const created = await insertPost(cleanData);
  revalidatePostsCache(created.slug);
  return created;
}

export async function editPost(rawPayload: unknown) {
  const cleanData = validatePostInput(rawPayload, true);
  await updatePost(cleanData);
  revalidatePostsCache(cleanData.slug);
  return { updatedId: cleanData.id };
}

export async function quickPublishPost(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid article ID is required.");
  }
  await publishPostImmediately(id.trim());
  revalidatePostsCache();
  return { publishedId: id };
}

export async function removePost(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid article ID is required for deletion.");
  }
  await deletePostById(id.trim());
  revalidatePostsCache();
  return { deletedId: id };
}

