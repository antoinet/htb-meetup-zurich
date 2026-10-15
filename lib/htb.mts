/**
 * Minimal Hack The Box Enterprise API client (https://enterprise.hackthebox.com/api/ext/v1)
 * and the onboarding business logic:
 *
 *   - existing user  -> assign the meetup license (expires after `days`)
 *   - unknown email  -> create a registration code (carries the license, expires after `days`)
 *   - unknown email that already has an unused code -> report it, or with `resend`
 *     delete that code and create a fresh one (the API has no "resend" endpoint)
 */

const DEFAULT_BASE_URL = "https://enterprise.hackthebox.com/api/ext/v1";

export interface HtbUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RegistrationCode {
  id: number;
  email: string;
  valid_until: string;
  duration_days: number;
  role: string;
  license: { id: number; name: string };
}

interface Paginated<T> {
  data: T[];
  links?: { next: string | null };
}

export type ProvisionResult =
  | { action: "license_assigned"; userId: number; expiresAt: string }
  | { action: "license_active"; userId: number }
  | { action: "invitation_sent"; codeId: number; validUntil: string; replacedCodeId?: number }
  | { action: "invitation_pending"; codeId?: number; validUntil?: string };

export interface HtbConfig {
  token: string;
  licenseId: number;
  days: number;
  role?: string;
  baseUrl?: string;
}

export class HtbApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "HtbApiError";
    this.status = status;
    this.body = body;
  }
}

type Api = <T>(
  method: "GET" | "POST" | "DELETE",
  pathOrUrl: string,
  opts?: { query?: Record<string, string | number>; body?: unknown },
) => Promise<T>;

function makeClient(token: string, baseUrl: string): Api {
  return async function api<T>(
    method: "GET" | "POST" | "DELETE",
    pathOrUrl: string,
    opts: { query?: Record<string, string | number>; body?: unknown } = {},
  ): Promise<T> {
    const url = new URL(pathOrUrl.startsWith("http") ? pathOrUrl : `${baseUrl}${pathOrUrl}`);
    for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, String(v));

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = text;
    }

    if (!res.ok) {
      const msg = (json as { message?: string } | undefined)?.message ?? `HTTP ${res.status}`;
      throw new HtbApiError(res.status, json, `${method} ${url.pathname}: ${msg}`);
    }
    return json as T;
  };
}

/** Follows `links.next` until exhausted. Query params go on the first request only. */
async function* paginate<T>(
  api: Api,
  path: string,
  query: Record<string, string | number>,
): AsyncGenerator<T> {
  let next: string | null = path;
  let first = true;
  while (next) {
    const page: Paginated<T> = await api<Paginated<T>>("GET", next, first ? { query } : {});
    first = false;
    yield* page.data;
    next = page.links?.next ?? null;
  }
}

const norm = (e: string) => e.trim().toLowerCase();

/** `keyword` is a fuzzy search, so only accept an exact (case-insensitive) email match. */
async function findUserByEmail(api: Api, email: string): Promise<HtbUser | undefined> {
  for await (const u of paginate<HtbUser>(api, "/users", { keyword: email })) {
    if (norm(u.email) === norm(email)) return u;
  }
  return undefined;
}

/** Unused registration code for this email, if any. */
async function findActiveRegistrationCode(
  api: Api,
  email: string,
): Promise<RegistrationCode | undefined> {
  for await (const c of paginate<RegistrationCode>(api, "/registration_codes", { active: 1 })) {
    if (norm(c.email) === norm(email)) return c;
  }
  return undefined;
}

/** 422 "User is already associated with this license." (observed in production). */
function isLicenseAlreadyAssigned(err: unknown): boolean {
  if (!(err instanceof HtbApiError) || err.status !== 422) return false;
  const body = err.body as { message?: string; errors?: { user?: string[] } } | undefined;
  return [body?.message ?? "", ...(body?.errors?.user ?? [])].some((m) =>
    /already associated with this license/i.test(m),
  );
}

function isActiveCodeConflict(err: unknown): boolean {
  if (!(err instanceof HtbApiError) || err.status !== 422) return false;
  const body = err.body as { errors?: { email?: string[] } } | undefined;
  return !!body?.errors?.email?.some((m) => /active registration code/i.test(m));
}

export async function provision(
  email: string,
  cfg: HtbConfig,
  opts: { resend?: boolean } = {},
): Promise<ProvisionResult> {
  const api = makeClient(cfg.token, cfg.baseUrl ?? DEFAULT_BASE_URL);
  const user = await findUserByEmail(api, email);

  if (user) {
    try {
      const { data } = await api<{ data: { expires_at: string; user: HtbUser } }>(
        "POST",
        `/licenses/${cfg.licenseId}/users`,
        { body: { user: user.id, expires_at: cfg.days } },
      );
      return { action: "license_assigned", userId: user.id, expiresAt: data.expires_at };
    } catch (err) {
      if (isLicenseAlreadyAssigned(err)) return { action: "license_active", userId: user.id };
      throw err;
    }
  }

  // Resend: delete the unused code first, otherwise creating a new one fails with 422.
  // If creating then fails, the next submission simply creates a fresh code.
  let replacedCodeId: number | undefined;
  if (opts.resend) {
    const existing = await findActiveRegistrationCode(api, email);
    if (existing) {
      await api("DELETE", `/registration_codes/${existing.id}`);
      replacedCodeId = existing.id;
    }
  }

  const createCode = () =>
    api<{ data: RegistrationCode }>("POST", "/registration_codes", {
      body: { email, role: cfg.role ?? "Guest", duration: cfg.days, license: cfg.licenseId },
    });

  try {
    const { data } = await createCode();
    return { action: "invitation_sent", codeId: data.id, validUntil: data.valid_until, replacedCodeId };
  } catch (err) {
    if (!isActiveCodeConflict(err)) throw err;
    const pending = await findActiveRegistrationCode(api, email);
    return { action: "invitation_pending", codeId: pending?.id, validUntil: pending?.valid_until };
  }
}
