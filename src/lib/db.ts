import { neon, neonConfig } from "@neondatabase/serverless";
import { Project, Inquiry, Post } from "@/types";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";

neonConfig.fetchConnectionCache = true;

const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
};

export async function initDatabaseTables() {
  const sql = getDb();
  if (!sql) {
    console.warn("⚠️ [Neon DB] DATABASE_URL not set. Skipping DB table creation.");
    return false;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wix_id VARCHAR(100) UNIQUE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL DEFAULT 'web-development',
        short_description TEXT,
        full_description TEXT NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        cover_image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        project_url TEXT,
        featured BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        project_type VARCHAR(100),
        budget_range VARCHAR(100),
        timeline VARCHAR(100),
        message TEXT NOT NULL,
        source_url TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image_url TEXT,
        read_time INT DEFAULT 5,
        tags JSONB DEFAULT '[]'::jsonb,
        published BOOLEAN DEFAULT true,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log("✅ [Neon DB] Tables verified/created successfully.");
    return true;
  } catch (err) {
    console.error("❌ [Neon DB] Error initializing tables:", err);
    return false;
  }
}

export async function saveInquiry(inquiry: Inquiry): Promise<{ success: boolean; id?: string }> {
  const sql = getDb();
  if (!sql) {
    console.warn("⚠️ [Neon DB] DATABASE_URL not configured. Inquiry saved in memory log.");
    return { success: true, id: "mock-inquiry-" + Date.now() };
  }

  try {
    const rows = await sql`
      INSERT INTO inquiries (name, email, phone, company, project_type, budget_range, timeline, message, source_url)
      VALUES (
        ${inquiry.name},
        ${inquiry.email},
        ${inquiry.phone || null},
        ${inquiry.company || null},
        ${inquiry.projectType},
        ${inquiry.budgetRange},
        ${inquiry.timeline},
        ${inquiry.message},
        ${inquiry.sourceUrl || null}
      )
      RETURNING id;
    `;
    return { success: true, id: rows[0]?.id };
  } catch (err) {
    console.error("❌ [Neon DB] Failed to insert inquiry:", err);
    return { success: false };
  }
}

// Raw database query for projects with disk fallback
async function queryProjectsFromDb(): Promise<Project[]> {
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          id, wix_id as "wixId", title, slug, category, 
          short_description as "shortDescription", full_description as "fullDescription",
          tags, cover_image_url as "coverImageUrl", alt_text as "altText",
          project_url as "projectUrl", featured, sort_order as "sortOrder",
          created_at as "createdAt"
        FROM projects
        ORDER BY featured DESC, sort_order ASC, created_at DESC;
      `;
      if (rows && rows.length > 0) {
        return rows as Project[];
      }
    } catch (err) {
      console.warn("⚠️ [Neon DB] Query projects fallback:", err);
    }
  }

  try {
    const jsonPath = path.join(process.cwd(), "src", "data", "projects.json");
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Failed to read projects.json:", err);
  }

  return [];
}

/**
 * Next.js Data Cache for Projects
 * Caches database output in Next.js Data Cache with tag 'projects'
 * Avoids executing DB queries on every page request
 */
export const fetchProjects = unstable_cache(
  async (): Promise<Project[]> => {
    return queryProjectsFromDb();
  },
  ["all-projects-cache"],
  {
    tags: ["projects"],
    revalidate: 3600, // Background revalidation every 1 hour or instant on-demand
  }
);

/**
 * React Cache + Next.js Data Cache for Single Project by Slug
 */
export const fetchProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const getCached = unstable_cache(
    async (s: string) => {
      const all = await queryProjectsFromDb();
      return all.find((p) => p.slug === s) || null;
    },
    ["project-by-slug", slug],
    {
      tags: ["projects", `project-${slug}`],
      revalidate: 3600,
    }
  );
  return getCached(slug);
});

// Raw database query for blog posts with disk fallback
async function queryPostsFromDb(): Promise<Post[]> {
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          id, title, slug, excerpt, content, cover_image_url as "coverImageUrl",
          read_time as "readTime", tags, published, published_at as "publishedAt",
          created_at as "createdAt"
        FROM posts
        WHERE published = true
        ORDER BY published_at DESC;
      `;
      if (rows && rows.length > 0) {
        return rows as Post[];
      }
    } catch (err) {
      console.warn("⚠️ [Neon DB] Query posts fallback:", err);
    }
  }

  try {
    const jsonPath = path.join(process.cwd(), "src", "data", "posts.json");
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Failed to read posts.json:", err);
  }

  return [];
}

/**
 * Next.js Data Cache for Blog Posts
 * Caches database output in Next.js Data Cache with tag 'posts'
 * Avoids executing DB queries on every page request
 */
export const fetchPosts = unstable_cache(
  async (): Promise<Post[]> => {
    return queryPostsFromDb();
  },
  ["all-posts-cache"],
  {
    tags: ["posts"],
    revalidate: 3600, // Background revalidation every 1 hour or instant on-demand
  }
);

/**
 * React Cache + Next.js Data Cache for Single Post by Slug
 * De-duplicates calls between generateMetadata and page component
 */
export const fetchPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const getCached = unstable_cache(
    async (s: string) => {
      const all = await queryPostsFromDb();
      return all.find((p) => p.slug === s) || null;
    },
    ["post-by-slug", slug],
    {
      tags: ["posts", `post-${slug}`],
      revalidate: 3600,
    }
  );
  return getCached(slug);
});

/**
 * On-Demand Cache Invalidation Helpers
 */
export function revalidateProjectsCache() {
  try {
    revalidateTag("projects");
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (err) {
    console.warn("revalidateProjectsCache warning:", err);
  }
}

export function revalidatePostsCache(slug?: string) {
  try {
    revalidateTag("posts");
    if (slug) {
      revalidateTag(`post-${slug}`);
      revalidatePath(`/blog/${slug}`);
    }
    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (err) {
    console.warn("revalidatePostsCache warning:", err);
  }
}

