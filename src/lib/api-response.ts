import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: unknown;
}

/**
 * Standardized Success Response
 */
export function apiSuccess<T extends Record<string, unknown>>(
  payload: T = {} as T,
  status = 200,
  headers: Record<string, string> = {}
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: true,
      ...payload,
    },
    { status, headers }
  );
}

/**
 * Standardized Client / Validation Error Response
 */
export function apiError(
  message: string,
  status = 400,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    { status }
  );
}

/**
 * Safe Global API Error Handler
 * NEVER leaks raw database exceptions, connection strings, or stack traces to clients.
 */
export function handleApiError(
  err: unknown,
  fallbackMessage = "An unexpected server error occurred. Please try again later."
): NextResponse<ApiResponse> {
  // 1. Always log detailed error on server for observability
  const errorObj = err instanceof Error ? err : new Error(String(err));
  console.error(`[API Internal Error] ${new Date().toISOString()}:`, {
    name: errorObj.name,
    message: errorObj.message,
    stack: errorObj.stack,
  });

  // 2. Client JSON syntax errors (e.g. malformed JSON in req.json())
  if (errorObj instanceof SyntaxError && errorObj.message.includes("JSON")) {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed JSON payload in request body.",
        code: "INVALID_JSON",
      },
      { status: 400 }
    );
  }

  // 3. Timeout Errors
  if (errorObj.name === "TimeoutError" || errorObj.name === "AbortError" || errorObj.message.toLowerCase().includes("timeout")) {
    return NextResponse.json(
      {
        success: false,
        error: "External service request timed out. Please try again.",
        code: "REQUEST_TIMEOUT",
      },
      { status: 504 }
    );
  }

  // 4. Known Safe Custom Application / Validation Errors
  if (errorObj.name === "ValidationError" || errorObj.constructor.name === "ValidationError") {
    return NextResponse.json(
      {
        success: false,
        error: errorObj.message,
        code: "VALIDATION_FAILED",
      },
      { status: 400 }
    );
  }

  // 5. Authentication / Permission Errors
  if (errorObj.name === "UnauthorizedError" || errorObj.message.includes("Unauthorized")) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required or insufficient permissions.",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  // 6. Database errors: Mask raw database schema, table names, and syntax errors
  const rawMsg = errorObj.message.toLowerCase();
  if (
    rawMsg.includes("violates") ||
    rawMsg.includes("relation") ||
    rawMsg.includes("column") ||
    rawMsg.includes("postgres") ||
    rawMsg.includes("neon") ||
    rawMsg.includes("connection") ||
    rawMsg.includes("sql")
  ) {
    return NextResponse.json(
      {
        success: false,
        error: fallbackMessage,
        code: "DATABASE_OPERATION_FAILED",
      },
      { status: 500 }
    );
  }

  // 6. Generic Fallback
  return NextResponse.json(
    {
      success: false,
      error: fallbackMessage,
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}
