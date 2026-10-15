import type { Config, Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import { provision } from "../../lib/htb.mts";

/**
 * POST /api/onboard   { email, code, website }
 *
 * Called by the onboarding form on https://htbzh.ch/onboarding.html.
 * The meetup code is checked BEFORE anything is looked up on HTB, so without the code
 * nobody can trigger emails or probe whether an address is a member.
 *
 * Environment variables:
 *   HTB_API_TOKEN      HTB Enterprise API token (required)
 *   MEETUP_CODE        code announced at the meetup; unset/empty = onboarding closed
 *   HTB_LICENSE_ID     license to grant (default 7425, "Meetup Lab")
 *   HTB_DURATION_DAYS  days until license / invitation expires (default 3)
 *   ALLOWED_ORIGINS    comma-separated CORS origins (default https://htbzh.ch)
 *   HTB_BASE_URL       override API base URL (testing only)
 */

// Same message for every successful outcome, so the page never reveals who is a member.
const SUCCESS_MESSAGE =
  "You're in! If you already have a Hack The Box Enterprise account, the Meetup Lab " +
  "has been added to it. Otherwise, check your inbox for an invitation from Hack The Box.";

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

function reply(req: Request, status: number, body: { ok: boolean; message: string }): Response {
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

  let payload: { email?: unknown; code?: unknown; website?: unknown };
  try {
    payload = await req.json();
  } catch {
    return reply(req, 400, { ok: false, message: "Invalid request." });
  }

  // Honeypot: real users never see this field. Pretend success so bots learn nothing.
  if (typeof payload.website === "string" && payload.website !== "") {
    console.warn("Honeypot triggered");
    return reply(req, 200, { ok: true, message: SUCCESS_MESSAGE });
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
    const result = await provision(email, {
      token,
      licenseId: Number(env("HTB_LICENSE_ID") ?? 7425),
      days: Number(env("HTB_DURATION_DAYS") ?? 3),
      baseUrl: env("HTB_BASE_URL"),
    });
    console.log(`Onboarded ${email}: ${JSON.stringify(result)}`);
    return reply(req, 200, { ok: true, message: SUCCESS_MESSAGE });
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
