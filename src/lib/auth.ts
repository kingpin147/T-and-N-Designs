import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tnn_designs_secure_jwt_secret_neon_2026"
);

const JWKS_URL =
  process.env.NEON_JWKS_URL ||
  process.env["JWKS URL"] ||
  "https://ep-fragrant-shape-b3p07m8b.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "project_manager" | "writer";
  permissions: {
    canManageLeads: boolean;
    canManageProjects: boolean;
    canManageBlog: boolean;
    canManageUsers: boolean;
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  // 1. Try local HMAC verification first
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    // 2. Try remote JWKS if issued by Neon Auth directly
    try {
      if (JWKS_URL) {
        const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
        const { payload } = await jwtVerify(token, JWKS);
        return {
          id: (payload.sub || payload.id) as string,
          email: (payload.email as string) || "",
          name: (payload.name as string) || "Team Member",
          role: (payload.role as any) || "writer",
          permissions: (payload.permissions as any) || {
            canManageLeads: false,
            canManageProjects: false,
            canManageBlog: true,
            canManageUsers: false,
          },
        };
      }
    } catch (remoteErr) {
      console.debug("Remote JWKS verify failed:", remoteErr);
    }
  }

  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("tnn_auth_token")?.value;
  if (!token) {
    return null;
  }
  return await verifyToken(token);
}

export async function getOwnerFallback(): Promise<SessionUser> {
  const ownerEmail = process.env.ADMIN_OWNER_EMAIL || "admin@tnndesigns.com";
  return {
    id: "owner-root",
    email: ownerEmail,
    name: "T & N Designs Owner",
    role: "admin",
    permissions: {
      canManageLeads: true,
      canManageProjects: true,
      canManageBlog: true,
      canManageUsers: true,
    },
  };
}

export async function authenticateWithNeon(email: string, passwordAttempt: string): Promise<SessionUser | null> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const sql = neon(connectionString);

  const users = await sql`
    SELECT u.id, u.name, u.email, u.role, a.password 
    FROM neon_auth.user u
    JOIN neon_auth.account a ON a."userId" = u.id
    WHERE LOWER(u.email) = LOWER(${email})
    LIMIT 1;
  `;

  if (users.length === 0) return null;

  const user = users[0];
  const isValid = await bcrypt.compare(passwordAttempt, user.password);
  if (!isValid) return null;

  // Retrieve permissions
  const perms = await sql`
    SELECT * FROM user_permissions WHERE LOWER(email) = LOWER(${email}) LIMIT 1;
  `;

  const role = (user.role || (perms[0]?.role) || "writer") as "admin" | "project_manager" | "writer";
  const permissions = perms.length > 0 ? {
    canManageLeads: perms[0].can_manage_leads,
    canManageProjects: perms[0].can_manage_projects,
    canManageBlog: perms[0].can_manage_blog,
    canManageUsers: perms[0].can_manage_users,
  } : {
    canManageLeads: role === "admin" || role === "project_manager",
    canManageProjects: role === "admin" || role === "project_manager",
    canManageBlog: true,
    canManageUsers: role === "admin",
  };

  return {
    id: user.id,
    email: user.email,
    name: user.name || "Team Member",
    role,
    permissions,
  };
}
