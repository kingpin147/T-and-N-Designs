import {
  ValidationError,
  validateRequiredString,
  sanitizeString,
  validateSlug,
  validateTags,
} from "./common";

export interface ValidatedPostInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readTime: number;
  tags: string[];
  published: boolean;
}

export function validatePostInput(body: unknown, isUpdate = false): ValidatedPostInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body. Expected JSON object.");
  }

  const data = body as Record<string, unknown>;

  let id: string | undefined = undefined;
  if (isUpdate) {
    id = validateRequiredString(data.id, "Article ID", 1, 100);
  }

  const title = validateRequiredString(data.title, "Article title", 5, 250);
  const content = validateRequiredString(data.content, "Article content", 20, 100000);

  const slug = validateSlug(data.slug, title);
  const excerpt = data.excerpt ? sanitizeString(data.excerpt, 500) : content.slice(0, 180).trim() + "...";
  const coverImageUrl = data.coverImageUrl ? sanitizeString(data.coverImageUrl, 500) : "/placeholder-blog.webp";
  const tags = validateTags(data.tags);
  const readTime = typeof data.readTime === "number" && data.readTime > 0 ? Math.min(Math.round(data.readTime), 120) : Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  const published = data.published !== undefined ? Boolean(data.published) : true;

  return {
    id,
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    readTime,
    tags,
    published,
  };
}

