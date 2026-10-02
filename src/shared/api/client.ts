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
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiGetOptions {
  query?: Record<string, string | number | undefined>;
  /** Seconds the response may be served from Next's data cache. */
  revalidate?: number;
}

/** GET a JSON resource from the backend. Server-side only. */
export async function apiGet<T>(
  path: string,
  { query = {}, revalidate = 60 }: ApiGetOptions = {},
): Promise<T> {
  const url = new URL(apiBase() + path);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error?.code ?? "unknown",
      body?.error?.message ?? response.statusText,
    );
  }
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
