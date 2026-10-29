import { neon } from "@neondatabase/serverless";
import { Inquiry } from "@/types";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
}

export async function createInquiry(inquiry: Inquiry): Promise<{ id: string }> {
  const sql = getSql();
  if (!sql) {
    console.warn("⚠️ [Inquiry Repository] DATABASE_URL not configured. Returning mock ID.");
    return { id: `mock-${Date.now()}` };
  }

  const rows = await sql`
    INSERT INTO inquiries (
      name, email, phone, company, project_type, 
      budget_range, timeline, message, source_url, status
    ) VALUES (
      ${inquiry.name},
      ${inquiry.email},
      ${inquiry.phone || null},
      ${inquiry.company || null},
      ${inquiry.projectType || "Custom Web Application"},
      ${inquiry.budgetRange || null},
      ${inquiry.timeline || null},
      ${inquiry.message},
      ${inquiry.sourceUrl || null},
      'new'
    )
    RETURNING id;
  `;

  return { id: rows[0].id };
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  const sql = getSql();
  if (!sql) return [];

  const rows = await sql`
    SELECT 
      id, name, email, phone, company, 
      project_type as "projectType", 
      budget_range as "budgetRange", 
      timeline, message, status, 
      created_at as "createdAt"
    FROM inquiries 
    ORDER BY created_at DESC;
  `;

  return rows as Inquiry[];
}

export async function updateInquiryStatus(id: string, status: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  await sql`
    UPDATE inquiries 
    SET status = ${status}
    WHERE id = ${id};
  `;
  return true;
}

export async function deleteInquiryById(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  await sql`DELETE FROM inquiries WHERE id = ${id};`;
  return true;
}

