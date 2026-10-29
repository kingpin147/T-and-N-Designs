import {
  ValidationError,
  validateRequiredString,
  sanitizeString,
  validateSlug,
  validateUrl,
  validateTags,
} from "./common";

export interface ValidatedProjectInput {
  id?: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  coverImageUrl: string;
  projectUrl?: string | null;
  featured: boolean;
}

export function validateProjectInput(body: unknown, isUpdate = false): ValidatedProjectInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body. Expected JSON object.");
  }

  const data = body as Record<string, unknown>;

  let id: string | undefined = undefined;
  if (isUpdate) {
    id = validateRequiredString(data.id, "Project ID", 1, 100);
  }

  const title = validateRequiredString(data.title, "Project title", 3, 200);
  const fullDescription = validateRequiredString(data.fullDescription, "Full description", 10, 10000);

  const slug = validateSlug(data.slug, title);
  const category = data.category ? sanitizeString(data.category, 50) : "web-development";
  const shortDescription = data.shortDescription ? sanitizeString(data.shortDescription, 500) : "";
  const tags = validateTags(data.tags);
  const coverImageUrl = data.coverImageUrl ? sanitizeString(data.coverImageUrl, 500) : "/placeholder-project.webp";
  const projectUrl = validateUrl(data.projectUrl, "Project live URL") || null;
  const featured = Boolean(data.featured);

  return {
    id,
    title,
    slug,
    category,
    shortDescription,
    fullDescription,
    tags,
    coverImageUrl,
    projectUrl,
    featured,
  };
}

