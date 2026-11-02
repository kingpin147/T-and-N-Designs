import { neon } from "@neondatabase/serverless";
import { Post } from "@/types";
import { ValidatedPostInput } from "@/validations/post.validator";
import { fetchPosts, fetchPostsDirect } from "@/lib/db";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
}

export async function findAllPosts(fresh = false, includeAll = false): Promise<Post[]> {
  if (fresh) {
    return fetchPostsDirect(includeAll);
  }
  return fetchPosts();
}

export async function insertPost(data: ValidatedPostInput): Promise<{ id: string; slug: string }> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  const pubAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString();

  const rows = await sql`
    INSERT INTO posts (
      title, slug, excerpt, content, cover_image_url, 
      read_time, tags, published, published_at
    ) VALUES (
      ${data.title}, 
      ${data.slug}, 
      ${data.excerpt}, 
      ${data.content}, 
      ${data.coverImageUrl}, 
      ${data.readTime}, 
      ${JSON.stringify(data.tags)}::jsonb, 
      ${data.published},
      ${pubAt}
    )
    RETURNING id, slug;
  `;

  return { id: rows[0].id, slug: rows[0].slug };
}

export async function updatePost(data: ValidatedPostInput): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  const pubAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString();

  await sql`
    UPDATE posts SET
      title = ${data.title},
      slug = ${data.slug},
      excerpt = ${data.excerpt},
      content = ${data.content},
      cover_image_url = ${data.coverImageUrl},
      read_time = ${data.readTime},
      tags = ${JSON.stringify(data.tags)}::jsonb,
      published = ${data.published},
      published_at = ${pubAt},
      updated_at = NOW()
    WHERE id = ${data.id};
  `;

  return true;
}

export async function publishPostImmediately(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`
    UPDATE posts SET
      published = true,
      published_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id};
  `;

  return true;
}

export async function deletePostById(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`DELETE FROM posts WHERE id = ${id};`;
  return true;
}

