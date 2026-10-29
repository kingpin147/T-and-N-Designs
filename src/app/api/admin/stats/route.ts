import { neon } from "@neondatabase/serverless";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
      return apiSuccess({
        stats: {
          totalLeads: 8,
          contactedLeads: 5,
          pendingLeads: 3,
          totalProjects: 85,
          totalPosts: 15,
        },
      });
    }

    const sql = neon(connectionString);

    const [inquiriesCount, projectsCount, postsCount, contactedCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM inquiries`,
      sql`SELECT COUNT(*) FROM projects`,
      sql`SELECT COUNT(*) FROM posts`,
      sql`SELECT COUNT(*) FROM inquiries WHERE status = 'contacted'`,
    ]);

    const totalLeads = parseInt(inquiriesCount[0]?.count || "0", 10);
    const contactedLeads = parseInt(contactedCount[0]?.count || "0", 10);

    return apiSuccess({
      stats: {
        totalLeads,
        contactedLeads,
        pendingLeads: Math.max(0, totalLeads - contactedLeads),
        totalProjects: parseInt(projectsCount[0]?.count || "0", 10),
        totalPosts: parseInt(postsCount[0]?.count || "0", 10),
      },
    });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to compute agency dashboard metrics.");
  }
}
