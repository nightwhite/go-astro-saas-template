export interface ApiResponse<T> {
  data: T;
  request_id?: string;
  pagination?: {
    page: number;
    page_size: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiClientConfig {
  baseURL: string;
}

export class ApiClientError extends Error {
  status: number;
  code?: string;
  requestID?: string;

  constructor(message: string, status: number, code?: string, requestID?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.requestID = requestID;
  }
}

export function normalizeError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiClientError(error.message, 500, "internal_error");
  }
  return new ApiClientError("Request failed", 500, "internal_error");
}

function recordFrontendRequestError() {
  try {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.sendBeacon("/api/v1/metrics/frontend-error", JSON.stringify({ source: "api-client" }));
      return;
    }
    fetch("/api/v1/metrics/frontend-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "api-client" }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Ignore telemetry errors to avoid breaking user requests.
  }
}

const defaultConfig: ApiClientConfig = {
  baseURL: "",
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const encoded = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(encoded)) {
      return decodeURIComponent(part.slice(encoded.length));
    }
  }
  return null;
}

async function ensureCSRFToken(config: ApiClientConfig): Promise<string | null> {
  const existing = getCookie("go_astro_csrf");
  if (existing) return existing;

  const resp = await fetch(buildURL("/api/v1/auth/csrf", config), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok) return null;
  const body = (await resp.json().catch(() => null)) as { data?: { token?: string } } | null;
  return body?.data?.token ?? getCookie("go_astro_csrf");
}

async function buildHeaders(method: string, resolved: ApiClientConfig): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-ID": "default",
  };

  const normalized = method.toUpperCase();
  if (normalized !== "GET" && normalized !== "HEAD" && normalized !== "OPTIONS") {
    const token = await ensureCSRFToken(resolved);
    if (!token) {
      throw new ApiClientError("missing csrf token", 403, "forbidden");
    }
    headers["X-CSRF-Token"] = token;
    // Some endpoints require an Idempotency-Key. Prefix to keep it easy to spot in logs.
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      headers["Idempotency-Key"] = `web_${crypto.randomUUID()}`;
    }
  }

  return headers;
}

function normalizeBaseURL(baseURL: string): string {
  return baseURL.replace(/\/+$/, "");
}

function buildURL(path: string, config: ApiClientConfig): string {
  if (config.baseURL === "") {
    return path.startsWith("/") ? path : `/${path}`;
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizeBaseURL(config.baseURL)}${trimmedPath}`;
}

function resolveConfig(config?: Partial<ApiClientConfig>): ApiClientConfig {
  return {
    baseURL: config?.baseURL || defaultConfig.baseURL,
  };
}

export function getQueryState(search: URLSearchParams) {
  const page = Math.max(1, Number(search.get("page") || "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(search.get("page_size") || "20") || 20));
  const sortBy = search.get("sort_by") || "";
  const sortOrder = search.get("sort_order") === "asc" ? "asc" : "desc";
  const filters: Record<string, string> = {};
  search.forEach((value, key) => {
    if (!key.startsWith("filter_")) return;
    const normalized = value.trim();
    if (normalized) {
      filters[key.slice("filter_".length)] = normalized;
    }
  });
  return { page, pageSize, sortBy, sortOrder, filters };
}

export function buildListQuery(query: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string>;
}) {
  const search = new URLSearchParams();
  search.set("page", String(query.page ?? 1));
  search.set("page_size", String(query.pageSize ?? 20));
  if (query.sortBy) {
    search.set("sort_by", query.sortBy);
  }
  if (query.sortOrder) {
    search.set("sort_order", query.sortOrder);
  }
  Object.entries(query.filters ?? {}).forEach(([key, value]) => {
    const normalized = value.trim();
    if (!normalized) return;
    search.set(`filter_${key}`, normalized);
  });
  return search;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    recordFrontendRequestError();
    throw new ApiClientError(
      body?.error?.message || `Request failed: ${response.status}`,
      response.status,
      body?.error?.code,
      body?.request_id,
    );
  }

  if (!body) {
    throw new Error("Empty response body");
  }

  return body;
}

export async function apiGet<T>(path: string, config?: Partial<ApiClientConfig>): Promise<ApiResponse<T>> {
  const resolved = resolveConfig(config);
  const headers = await buildHeaders("GET", resolved);
  let response: Response;
  try {
    response = await fetch(buildURL(path, resolved), {
      headers,
      credentials: "include",
    });
  } catch (error) {
    recordFrontendRequestError();
    throw normalizeError(error);
  }

  return parseResponse<T>(response);
}

export async function apiPost<T>(path: string, payload: unknown, config?: Partial<ApiClientConfig>): Promise<ApiResponse<T>> {
  const resolved = resolveConfig(config);
  const headers = await buildHeaders("POST", resolved);
  let response: Response;
  try {
    response = await fetch(buildURL(path, resolved), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    recordFrontendRequestError();
    throw normalizeError(error);
  }

  return parseResponse<T>(response);
}

export async function apiPut<T>(path: string, payload: unknown, config?: Partial<ApiClientConfig>): Promise<ApiResponse<T>> {
  const resolved = resolveConfig(config);
  const headers = await buildHeaders("PUT", resolved);
  let response: Response;
  try {
    response = await fetch(buildURL(path, resolved), {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    recordFrontendRequestError();
    throw normalizeError(error);
  }

  return parseResponse<T>(response);
}

export async function apiPatch<T>(path: string, payload: unknown, config?: Partial<ApiClientConfig>): Promise<ApiResponse<T>> {
  const resolved = resolveConfig(config);
  const headers = await buildHeaders("PATCH", resolved);
  let response: Response;
  try {
    response = await fetch(buildURL(path, resolved), {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    recordFrontendRequestError();
    throw normalizeError(error);
  }

  return parseResponse<T>(response);
}

export async function apiDelete<T>(path: string, payload: unknown, config?: Partial<ApiClientConfig>): Promise<ApiResponse<T>> {
  const resolved = resolveConfig(config);
  const headers = await buildHeaders("DELETE", resolved);
  let response: Response;
  try {
    response = await fetch(buildURL(path, resolved), {
      method: "DELETE",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    recordFrontendRequestError();
    throw normalizeError(error);
  }

  return parseResponse<T>(response);
}
