/**
 * Centralized HTTP Client with Enforced Timeout Protection
 * Prevents hanging sockets and server thread exhaustion.
 */

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const { timeoutMs = 8000, ...fetchOptions } = options;

  // Use native AbortSignal.timeout if available, with AbortController fallback
  let signal: AbortSignal;
  let timeoutId: NodeJS.Timeout | null = null;

  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    signal = AbortSignal.timeout(timeoutMs);
    if (fetchOptions.signal) {
      // If caller also provided a signal, combine them
      signal = AbortSignal.any ? AbortSignal.any([signal, fetchOptions.signal]) : signal;
    }
  } else {
    const controller = new AbortController();
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    signal = controller.signal;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal,
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      const timeoutError = new Error(`Request to ${new URL(url).hostname} timed out after ${timeoutMs}ms.`);
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

