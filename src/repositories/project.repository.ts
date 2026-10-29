import { neon } from "@neondatabase/serverless";
import { Project } from "@/types";
import { ValidatedProjectInput } from "@/validations/project.validator";
import { fetchProjects } from "@/lib/db";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
}

export async function findAllProjects(): Promise<Project[]> {
  return fetchProjects();
}

export async function insertProject(data: ValidatedProjectInput): Promise<{ id: string; slug: string }> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  const rows = await sql`
    INSERT INTO projects (
      title, slug, category, short_description, full_description, 
      tags, cover_image_url, project_url, featured
    ) VALUES (
      ${data.title}, 
      ${data.slug}, 
      ${data.category}, 
      ${data.shortDescription},
      ${data.fullDescription}, 
      ${JSON.stringify(data.tags)}::jsonb, 
      ${data.coverImageUrl}, 
      ${data.projectUrl}, 
      ${data.featured}
    )
    RETURNING id, slug;
  `;

  return { id: rows[0].id, slug: rows[0].slug };
}

export async function updateProject(data: ValidatedProjectInput): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`
    UPDATE projects SET
      title = ${data.title},
      slug = ${data.slug},
      category = ${data.category},
      short_description = ${data.shortDescription},
      full_description = ${data.fullDescription},
      tags = ${JSON.stringify(data.tags)}::jsonb,
      cover_image_url = ${data.coverImageUrl},
      project_url = ${data.projectUrl},
      featured = ${data.featured},
      updated_at = NOW()
    WHERE id = ${data.id};
  `;

  return true;
}

export async function deleteProjectById(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`DELETE FROM projects WHERE id = ${id};`;
  return true;
}

