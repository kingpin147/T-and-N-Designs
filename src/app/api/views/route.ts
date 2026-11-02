import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, slug, id } = body;

    if (!type || (type !== "project" && type !== "post")) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'project' or 'post'." },
        { status: 400 }
      );
    }

    if (!slug && !id) {
      return NextResponse.json(
        { success: false, error: "Either 'slug' or 'id' is required." },
        { status: 400 }
      );
    }

    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Database not configured." },
        { status: 503 }
      );
    }

    let updatedViews = 0;

    if (type === "project") {
      let rows;
      if (id) {
        rows = await sql`
          UPDATE projects
          SET views = COALESCE(views, 0) + 1, updated_at = NOW()
          WHERE id = ${id}
          RETURNING views;
        `;
      } else {
        rows = await sql`
          UPDATE projects
          SET views = COALESCE(views, 0) + 1, updated_at = NOW()
          WHERE slug = ${slug}
          RETURNING views;
        `;
      }

      if (rows && rows.length > 0) {
        updatedViews = rows[0].views;
      }
    } else if (type === "post") {
      let rows;
      if (id) {
        rows = await sql`
          UPDATE posts
          SET views = COALESCE(views, 0) + 1
          WHERE id = ${id}
          RETURNING views;
        `;
      } else {
        rows = await sql`
          UPDATE posts
          SET views = COALESCE(views, 0) + 1
          WHERE slug = ${slug}
          RETURNING views;
        `;
      }

      if (rows && rows.length > 0) {
        updatedViews = rows[0].views;
      }
    }

    return NextResponse.json({
      success: true,
      type,
      views: updatedViews,
    });
  } catch (err: unknown) {
    console.error("❌ [API views] Error incrementing views:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record view." },
      { status: 500 }
    );
  }
}
