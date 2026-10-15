import type { Config, Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import { provision, type ProvisionResult } from "../../lib/htb.mts";

/**
 * POST /api/onboard   { email, code, resend?, website }
 *   -> { ok, status, message }
 *      status: license_assigned | license_active | invitation_sent | invitation_pending
 *
 * Called by the onboarding form on https://htbzh.ch/onboarding.html.
 * The meetup code is checked BEFORE anything is looked up on HTB, so without the code
 * nobody can trigger emails. With the code, the response tells the participant what
 * happened (accepted trade-off: someone who knows the code can tell members apart).
 *
 * Environment variables:
 *   HTB_API_TOKEN      HTB Enterprise API token (required)
 *   MEETUP_CODE        code announced at the meetup; unset/empty = onboarding closed
 *   HTB_LICENSE_ID     license to grant (default 7425, "Meetup Lab")
 *   HTB_DURATION_DAYS  days until license / invitation expires (default 3)
 *   ALLOWED_ORIGINS    comma-separated CORS origins (default https://htbzh.ch)
 *   HTB_BASE_URL       override API base URL (testing only)
 */

const HTB_URL = "https://enterprise.hackthebox.com";

function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
  });
}

function describe(result: ProvisionResult): string {
  switch (result.action) {
    case "license_assigned": {
      const until = formatDate(result.expiresAt);
      return (
        `Welcome back! The Meetup Lab has been added to your Hack The Box Enterprise account` +
        `${until ? ` until ${until}` : ""}. Sign in at ${HTB_URL} to get started.`
      );
    }
    case "license_active":
      return (
        "Good news: the Meetup Lab is already active on your Hack The Box Enterprise account. " +
        `Sign in at ${HTB_URL} to get started.`
      );
    case "invitation_sent":
      return result.replacedCodeId
        ? "A new invitation is on its way. The link in any earlier invitation no longer works, " +
            "so use the one in the newest email from Hack The Box."
        : "Invitation sent! Check your inbox (and spam folder) for an email from Hack The Box, " +
            "then follow the link to create your account. The Meetup Lab is included.";
    case "invitation_pending": {
      const until = formatDate(result.validUntil);
      return (
        `An invitation was already sent to this address and hasn't been used yet` +
        `${until ? ` (valid until ${until})` : ""}. Can't find it? Check your spam folder, ` +
        `or send a new one.`
      );
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const env = (name: string) => Netlify.env.get(name)?.trim() || undefined;

function corsHeaders(req: Request): Record<string, string> {
  const allowed = (env("ALLOWED_ORIGINS") ?? "https://htbzh.ch")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = { Vary: "Origin" };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function reply(
  req: Request,
  status: number,
  body: { ok: boolean; message: string; status?: string },
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

/** Constant-time, case-insensitive comparison (codes are read off a slide). */
function codeMatches(given: string, expected: string): boolean {
  const h = (s: string) => createHash("sha256").update(s.trim().toLowerCase()).digest();
  return timingSafeEqual(h(given), h(expected));
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, 405, { ok: false, message: "Method not allowed." });

  let payload: { email?: unknown; code?: unknown; resend?: unknown; website?: unknown };
  try {
    payload = await req.json();
  } catch {
    return reply(req, 400, { ok: false, message: "Invalid request." });
  }

  // Honeypot: real users never see this field. Pretend success so bots learn nothing.
  if (typeof payload.website === "string" && payload.website !== "") {
    console.warn("Honeypot triggered");
    return reply(req, 200, { ok: true, status: "invitation_sent", message: "Invitation sent!" });
  }

  // Lowercase so the member lookup can't miss "Jane@x.ch" vs "jane@x.ch" and send a duplicate invite.
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const code = typeof payload.code === "string" ? payload.code : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply(req, 400, { ok: false, message: "Please enter a valid email address." });
  }

  const expected = env("MEETUP_CODE");
  if (!expected) {
    return reply(req, 403, {
      ok: false,
      message: "Onboarding is closed right now. It opens at the start of each meetup.",
    });
  }
  if (!codeMatches(code, expected)) {
    console.warn("Wrong meetup code submitted");
    return reply(req, 403, {
      ok: false,
      message: "That meetup code isn't right. Check the slide or ask the organiser.",
    });
  }

  const token = env("HTB_API_TOKEN");
  if (!token) {
    console.error("HTB_API_TOKEN is not set");
    return reply(req, 500, { ok: false, message: "Onboarding is misconfigured. Please tell the organiser." });
  }

  try {
    const result = await provision(
      email,
      {
        token,
        licenseId: Number(env("HTB_LICENSE_ID") ?? 7425),
        days: Number(env("HTB_DURATION_DAYS") ?? 3),
        baseUrl: env("HTB_BASE_URL"),
      },
      { resend: payload.resend === true },
    );
    console.log(`Onboarded ${email}: ${JSON.stringify(result)}`);
    return reply(req, 200, { ok: true, status: result.action, message: describe(result) });
  } catch (err) {
    console.error(`Onboarding failed for ${email}:`, err, (err as { body?: unknown }).body);
    return reply(req, 502, {
      ok: false,
      message: "Something went wrong on our side. Please ask the organiser for help.",
    });
  }
};

export const config: Config = {
  path: "/api/onboard",
  rateLimit: {
    windowLimit: 20, // counts preflights too, so roughly 10 submissions per minute per IP
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
