import {
  ValidationError,
  validateEmail,
  validateRequiredString,
  sanitizeString,
} from "./common";

export interface ValidatedInviteInput {
  name: string;
  email: string;
  role: "admin" | "project_manager" | "writer";
  permissions: {
    canManageLeads: boolean;
    canManageProjects: boolean;
    canManageBlog: boolean;
    canManageUsers: boolean;
  };
}

export function validateInviteInput(body: unknown): ValidatedInviteInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body. Expected JSON object.");
  }

  const data = body as Record<string, unknown>;

  const name = validateRequiredString(data.name, "Full name", 2, 100);
  const email = validateEmail(data.email);

  const rawRole = sanitizeString(data.role, 30);
  let role: "admin" | "project_manager" | "writer" = "writer";
  if (rawRole === "admin" || rawRole === "project_manager" || rawRole === "writer") {
    role = rawRole;
  }

  const rawPerms = (data.permissions || {}) as Record<string, unknown>;
  const permissions = {
    canManageLeads: role === "admin" || role === "project_manager" || Boolean(rawPerms.canManageLeads),
    canManageProjects: role === "admin" || role === "project_manager" || Boolean(rawPerms.canManageProjects),
    canManageBlog: true,
    canManageUsers: role === "admin" || Boolean(rawPerms.canManageUsers),
  };

  return {
    name,
    email,
    role,
    permissions,
  };
}

export function validateLoginInput(body: unknown): { email: string; password: string } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body. Expected JSON object.");
  }

  const data = body as Record<string, unknown>;
  const email = validateEmail(data.email);
  const password = validateRequiredString(data.password, "Password", 1, 200);

  return { email, password };
}

