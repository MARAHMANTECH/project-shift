// API client for Project SHIFT
// Wraps fetch with base URL, error handling, and Clerk auth token injection
// Per .rules/04: NEVER use useEffect + fetch. Use React Query hooks.

import { APP_CONFIG } from "@/config/app";

const API_BASE = `${APP_CONFIG.apiUrl}/api/v1`;

/** RFC 7807 Problem Details error */
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public detail: ApiError
  ) {
    super(detail.message);
    this.name = "ApiClientError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      statusCode: response.status,
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new ApiClientError(response.status, error);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Auth token provider — sættes af AuthTokenProvider komponenten
 * så alle API-kald automatisk inkluderer Clerk JWT
 */
let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(getToken: () => Promise<string | null>): void {
  _getToken = getToken;
}

async function buildHeaders(init?: RequestInit): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Inject Clerk auth token
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // Token retrieval failed — continue without auth
      console.warn("[API Client] Kunne ikke hente auth token");
    }
  }

  // Custom headers from init override defaults
  if (init?.headers) {
    Object.assign(headers, init.headers);
  }

  return headers;
}

export const apiClient = {
  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = await buildHeaders(init);
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers,
      ...init,
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const headers = await buildHeaders(init);
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const headers = await buildHeaders(init);
    const response = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = await buildHeaders(init);
    const response = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers,
      ...init,
    });
    return handleResponse<T>(response);
  },
};

export { ApiClientError };
