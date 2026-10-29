import { neon } from "@neondatabase/serverless";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }
  return neon(connectionString);
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  canManageLeads: boolean;
  canManageProjects: boolean;
  canManageBlog: boolean;
  canManageUsers: boolean;
}

export async function findAllTeamMembers(): Promise<TeamMemberRecord[]> {
  const sql = getSql();
  if (!sql) return [];

  const rows = await sql`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role, 
      u."createdAt" as "createdAt",
      COALESCE(p.can_manage_leads, false) as "canManageLeads",
      COALESCE(p.can_manage_projects, false) as "canManageProjects",
      COALESCE(p.can_manage_blog, true) as "canManageBlog",
      COALESCE(p.can_manage_users, false) as "canManageUsers"
    FROM neon_auth.user u
    LEFT JOIN user_permissions p ON LOWER(p.email) = LOWER(u.email)
    ORDER BY u."createdAt" ASC;
  `;

  return rows as TeamMemberRecord[];
}

export async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql`
    SELECT id FROM neon_auth.user WHERE LOWER(email) = LOWER(${email}) LIMIT 1;
  `;
  return rows.length > 0 ? { id: rows[0].id } : null;
}

export async function createTeamMember(
  name: string,
  email: string,
  role: string,
  passwordHash: string,
  permissions: {
    canManageLeads: boolean;
    canManageProjects: boolean;
    canManageBlog: boolean;
    canManageUsers: boolean;
  }
): Promise<{ id: string }> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  // 1. Insert into neon_auth.user
  const userRows = await sql`
    INSERT INTO neon_auth.user (name, email, "emailVerified", role, banned, "createdAt", "updatedAt")
    VALUES (${name}, ${email.toLowerCase()}, true, ${role}, false, NOW(), NOW())
    RETURNING id;
  `;
  const userId = userRows[0].id;

  // 2. Insert into neon_auth.account
  await sql`
    INSERT INTO neon_auth.account ("accountId", "providerId", "userId", password, "createdAt", "updatedAt")
    VALUES (${email.toLowerCase()}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW());
  `;

  // 3. Upsert into user_permissions
  await sql`
    INSERT INTO user_permissions (email, role, can_manage_leads, can_manage_projects, can_manage_blog, can_manage_users, updated_at)
    VALUES (${email.toLowerCase()}, ${role}, ${permissions.canManageLeads}, ${permissions.canManageProjects}, ${permissions.canManageBlog}, ${permissions.canManageUsers}, NOW())
    ON CONFLICT (email) DO UPDATE SET
      role = EXCLUDED.role,
      can_manage_leads = EXCLUDED.can_manage_leads,
      can_manage_projects = EXCLUDED.can_manage_projects,
      can_manage_blog = EXCLUDED.can_manage_blog,
      can_manage_users = EXCLUDED.can_manage_users,
      updated_at = NOW();
  `;

  return { id: userId };
}

export async function updateTeamMemberRole(
  email: string,
  role: string,
  permissions?: {
    canManageLeads?: boolean;
    canManageProjects?: boolean;
    canManageBlog?: boolean;
    canManageUsers?: boolean;
  }
): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`
    UPDATE neon_auth.user 
    SET role = ${role}, "updatedAt" = NOW()
    WHERE LOWER(email) = LOWER(${email});
  `;

  if (permissions) {
    await sql`
      INSERT INTO user_permissions (email, role, can_manage_leads, can_manage_projects, can_manage_blog, can_manage_users, updated_at)
      VALUES (
        ${email.toLowerCase()}, 
        ${role}, 
        ${Boolean(permissions.canManageLeads)}, 
        ${Boolean(permissions.canManageProjects)}, 
        ${Boolean(permissions.canManageBlog)}, 
        ${Boolean(permissions.canManageUsers)}, 
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        can_manage_leads = EXCLUDED.can_manage_leads,
        can_manage_projects = EXCLUDED.can_manage_projects,
        can_manage_blog = EXCLUDED.can_manage_blog,
        can_manage_users = EXCLUDED.can_manage_users,
        updated_at = NOW();
    `;
  }

  return true;
}

export async function deleteTeamMember(email: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    throw new Error("Database connection is not configured.");
  }

  await sql`DELETE FROM user_permissions WHERE LOWER(email) = LOWER(${email});`;
  await sql`DELETE FROM neon_auth.account WHERE LOWER("accountId") = LOWER(${email});`;
  await sql`DELETE FROM neon_auth.user WHERE LOWER(email) = LOWER(${email});`;

  return true;
}

