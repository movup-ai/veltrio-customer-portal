/** Backend base URL. Fails with setup instructions instead of an opaque "Invalid URL". */
function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env and set it to the backend API base URL, e.g. https://api.example.com/api/v1.",
    );
  }
  return base;
}

/** The API's pagination envelope. */
export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** What the API adds to the message, e.g. the fields a 422 rejected. */
    readonly details: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function toApiError(response: Response) {
  const body = await response.json().catch(() => null);
  return new ApiError(
    response.status,
    body?.error?.code ?? "unknown",
    body?.error?.message ?? response.statusText,
    body?.error?.details ?? null,
  );
}

/**
 * How long a response is reused before the backend is asked again, in seconds.
 * Off in development, so a change in the database shows on the next reload.
 */
const DEFAULT_REVALIDATE = process.env.NODE_ENV === "development" ? 0 : 60;

interface ApiGetOptions {
  query?: Record<string, string | number | undefined>;
  /** Seconds the response may be served from Next's data cache; 0 always asks the backend. */
  revalidate?: number;
}

/** GET a JSON resource from the backend. Server-side only. */
export async function apiGet<T>(
  path: string,
  { query = {}, revalidate = DEFAULT_REVALIDATE }: ApiGetOptions = {},
): Promise<T> {
  const url = new URL(apiBase() + path);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) throw await toApiError(response);
  return response.json() as Promise<T>;
}

/** POST JSON to the backend and read its JSON answer. Server-side only. */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiBase() + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) throw await toApiError(response);
  return response.json() as Promise<T>;
}

const PAGE_SIZE = 100; // the API's maximum

/** Every item of a paginated list endpoint, walking its pages. */
export async function apiGetAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let total = Infinity;
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const page = await apiGet<Page<T>>(path, {
      query: { limit: PAGE_SIZE, offset },
    });
    items.push(...page.items);
    total = page.total;
  }
  return items;
}
