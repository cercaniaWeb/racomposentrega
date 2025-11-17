import { createClient } from "npm:@supabase/supabase-js@4.30.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Fail-fast if required env vars are missing
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY - aborting startup");
  throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// --- Configuration ---
interface ReportRequest {
  report?: string;
  reportType?: string; // For backward compatibility
  params?: Record<string, any>;
}

// Read ALLOWED_ORIGINS from env (CSV) with fallback to a safe default
const ALLOWED_ORIGINS_ENV = Deno.env.get("ALLOWED_ORIGINS");
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];
const ALLOWED_ORIGINS = ALLOWED_ORIGINS_ENV
  ? ALLOWED_ORIGINS_ENV.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

// Optional reporting secret for internal calls
const REPORTING_API_SECRET = Deno.env.get("REPORTING_API_SECRET") || null;

// RPC timeout (ms)
const MAX_RPC_TIMEOUT_MS = Number(Deno.env.get("MAX_RPC_TIMEOUT_MS") ?? "10000");

// Rate limiter config (allow overriding via env)
const RATE_LIMIT_BURST = Number(Deno.env.get("RATE_LIMIT_BURST") ?? "10");
const RATE_REFILL_INTERVAL_MS = Number(Deno.env.get("RATE_REFILL_INTERVAL_MS") ?? "6000");
const RATE_REFILL_AMOUNT = Number(Deno.env.get("RATE_REFILL_AMOUNT") ?? "1");

// Helper functions for CORS
function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-reporting-secret",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
  headers["Access-Control-Allow-Origin"] = allowed ?? "null";
  return headers;
}

function addCorsHeaders(response: Response, origin: string | null) {
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// --- Simple in-memory caches and limiter (per-edge-instance) ---
const roleCache = new Map<string, { is_admin: boolean; role?: string; expires: number }>();
const ROLE_CACHE_TTL_MS = 60 * 1000; // 60s

type RateState = { tokens: number; lastRefill: number };
const RATE_LIMIT_MAP = new Map<string, RateState>();

function rateAllow(userKey: string) {
  const now = Date.now();
  let st = RATE_LIMIT_MAP.get(userKey);
  if (!st) {
    st = { tokens: RATE_LIMIT_BURST, lastRefill: now };
    RATE_LIMIT_MAP.set(userKey, st);
  }
  // refill
  const elapsed = now - st.lastRefill;
  if (elapsed >= RATE_REFILL_INTERVAL_MS) {
    const ticks = Math.floor(elapsed / RATE_REFILL_INTERVAL_MS);
    st.tokens = Math.min(RATE_LIMIT_BURST, st.tokens + ticks * RATE_REFILL_AMOUNT);
    st.lastRefill += ticks * RATE_REFILL_INTERVAL_MS;
  }
  if (st.tokens > 0) {
    st.tokens -= 1;
    return true;
  }
  return false;
}

// --- Utilities ---
function isISODateString(s: any) {
  if (!s || typeof s !== "string") return false;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

function parseDateOrNull(s: any) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// Validate JWT and role (unchanged logic)...
async function validateJWTAndRole(authHeader: string) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const jwt = authHeader.substring(7);

  try {
    const { data: userData, error: userError } = await svc.auth.getUser(jwt);
    if (userError || !userData?.user) {
      console.warn("JWT validation failed", userError?.message ?? "no user");
      return null;
    }
    const user = userData.user;
    const cached = roleCache.get(user.id);
    if (cached && cached.expires > Date.now()) {
      return { user_id: user.id, is_admin: cached.is_admin, role: cached.role };
    }

    let roleClaim: string | null = null;
    try {
      roleClaim = (user.user_metadata && (user.user_metadata as any).role) ||
                  (user.app_metadata && (user.app_metadata as any).role) ||
                  null;
    } catch (e) {
      roleClaim = null;
    }

    let isAdmin = false;
    if (roleClaim && (roleClaim === "admin" || roleClaim === "administrator")) {
      isAdmin = true;
    } else {
      const { data: dbUser, error: dbErr } = await svc
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!dbErr && dbUser && (dbUser.role === "admin" || dbUser.role === "administrator")) {
        isAdmin = true;
        roleClaim = dbUser.role;
      }
    }

    const cacheVal = { is_admin: isAdmin, role: roleClaim ?? undefined, expires: Date.now() + ROLE_CACHE_TTL_MS };
    roleCache.set(user.id, cacheVal);
    return { user_id: user.id, is_admin: isAdmin, role: cacheVal.role ?? null };
  } catch (err) {
    console.error("validateJWTAndRole error", err);
    return null;
  }
}

// --- Date utility for ISO week previous week (unchanged) ---
function isoWeekRangeForPreviousWeek(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const startOfThisWeek = new Date(d);
  startOfThisWeek.setUTCDate(d.getUTCDate() - daysSinceMonday);
  startOfThisWeek.setUTCHours(0, 0, 0, 0);
  const startPrev = new Date(startOfThisWeek);
  startPrev.setUTCDate(startPrev.getUTCDate() - 7);
  const endPrev = new Date(startPrev);
  endPrev.setUTCDate(endPrev.getUTCDate() + 6);
  endPrev.setUTCHours(23, 59, 59, 999);
  return { start: startPrev.toISOString(), end: endPrev.toISOString() };
}

// --- RPC helper with timeout ---
async function callRpcSafe(name: string, params: Record<string, any>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAX_RPC_TIMEOUT_MS);
  try {
    const { data, error } = await svc.rpc(name, params, { signal: controller.signal as any });
    clearTimeout(timeout);
    if (error) {
      console.error("RPC error", name, error);
      return { error: error.message || "rpc_error", data: null };
    }
    return { error: null, data };
  } catch (err: any) {
    clearTimeout(timeout);
    const isAbort = err?.name === "AbortError";
    console.error("RPC call exception", name, isAbort ? "timeout" : err);
    return { error: isAbort ? "rpc_timeout" : (err?.message ?? "rpc_exception"), data: null };
  }
}

// --- Report generators (unchanged logic except using callRpcSafe) ---
async function generateTopProducts(params: any, userId: string | null) {
  let from: string, to: string;
  if (params?.period === "last_week" || (!params?.from && !params?.to)) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return { error: "invalid_dates", data: null };
  }

  const limit = Math.min(100, params?.limit ? Number(params.limit) || 3 : 3);
  const storeId = params?.store_id || null;

  const rpcName = "reports.top_products";
  const rpcParams = { p_from: from, p_to: to, p_store_id: storeId, p_limit: limit };

  const res = await callRpcSafe(rpcName, rpcParams);

  // log asynchronously but swallow failures (use a try/catch and log at debug level)
  if (userId) {
    (async () => {
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "top_products",
          params,
          format: "json",
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.debug("report_requests insert failed", e?.message ?? e);
      }
    })();
  }

  return res;
}

async function generateSalesByCategory(params: any, userId: string | null) {
  let from: string, to: string;
  if (params?.period === "last_week" || (!params?.from && !params?.to)) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return { error: "invalid_dates", data: null };
  }

  const storeId = params?.store_id || null;
  const res = await callRpcSafe("reports.sales_by_category", { p_from: from, p_to: to, p_store_id: storeId });

  if (userId) {
    (async () => {
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "sales_by_category",
          params,
          format: "json",
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.debug("report_requests insert failed", e?.message ?? e);
      }
    })();
  }

  return res;
}

async function generateSalesSummary(params: any, userId: string | null) {
  let from: string, to: string;
  if (params?.period === "last_week" || (!params?.from && !params?.to)) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return { error: "invalid_dates", data: null };
  }

  const storeId = params?.store_id || null;
  const res = await callRpcSafe("reports.sales_summary", { p_from: from, p_to: to, p_store_id: storeId });

  if (userId) {
    (async () => {
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "sales_summary",
          params,
          format: "json",
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.debug("report_requests insert failed", e?.message ?? e);
      }
    })();
  }

  return res;
}

console.info("Reporting function initialized");

// --- Main server ---
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST" && req.method !== "GET") {
      const response = new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    const url = new URL(req.url);

    // Optional internal secret check
    const reportingSecretHeader = req.headers.get("x-reporting-secret");
    if (REPORTING_API_SECRET && reportingSecretHeader !== REPORTING_API_SECRET) {
      const response = new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    // Authorization
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      const response = new Response(JSON.stringify({ error: "missing_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    const userAuth = await validateJWTAndRole(authHeader);
    if (!userAuth) {
      const response = new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    // Rate limit check per user id
    const userKey = `u:${userAuth.user_id}`;
    if (!rateAllow(userKey)) {
      const response = new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    // Only admins allowed
    if (!userAuth.is_admin) {
      const response = new Response(JSON.stringify({ error: "forbidden", message: "admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    // Routes (updated to match the expected paths in the frontend)
    if (url.pathname === "/reporting" && req.method === "GET") {
      const body = {
        reports: [
          {
            name: "top_products",
            description: "Productos más vendidos en un periodo",
            params: {
              period: ["last_week", "from/to"],
              limit: "integer (max 100)",
              store_id: "string|null",
              format: ["json"],
            },
          },
          {
            name: "sales_by_category",
            description: "Ventas por categoría en un periodo",
            params: {
              period: ["last_week", "from/to"],
              store_id: "string|null",
              format: ["json"],
            },
          },
          {
            name: "sales_summary",
            description: "Resumen de ventas en un periodo",
            params: {
              period: ["last_week", "from/to"],
              store_id: "string|null",
              format: ["json"],
            },
          },
        ],
      };
      const response = new Response(JSON.stringify(body), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    if (url.pathname === "/reporting/status" && req.method === "GET") {
      const response = new Response(JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        available_reports: ["top_products", "sales_by_category", "sales_summary"],
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    if (url.pathname === "/reporting/generate" && req.method === "POST") {
      let body: ReportRequest;
      try {
        body = await req.json();
      } catch (e) {
        const response = new Response(JSON.stringify({ error: "invalid_json" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }

      // Check for both 'report' and 'reportType' to maintain compatibility
      const reportType = body?.report || body?.reportType;
      if (!reportType) {
        const response = new Response(JSON.stringify({ error: "report_required", expected: { report: "string" } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }

      const allowedReports = ["top_products", "sales_by_category", "sales_summary"];
      if (!allowedReports.includes(reportType)) {
        const response = new Response(JSON.stringify({ error: "report_not_supported" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }

      // Validate params superficially
      const params = body.params || {};
      if (params.from && !isISODateString(params.from)) {
        const response = new Response(JSON.stringify({ error: "invalid_from_date" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }
      if (params.to && !isISODateString(params.to)) {
        const response = new Response(JSON.stringify({ error: "invalid_to_date" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }
      if (params.limit && (!(Number(params.limit) > 0))) {
        const response = new Response(JSON.stringify({ error: "invalid_limit" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }

      // Generate
      let result;
      switch (reportType) {
        case "top_products":
          result = await generateTopProducts(params, userAuth.user_id);
          break;
        case "sales_by_category":
          result = await generateSalesByCategory(params, userAuth.user_id);
          break;
        case "sales_summary":
          result = await generateSalesSummary(params, userAuth.user_id);
          break;
        default:
          const response = new Response(JSON.stringify({ error: "report_not_implemented" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
          return addCorsHeaders(response, origin);
      }

      if (result.error) {
        const response = new Response(JSON.stringify({ error: "query_failed" }), {
          status: 400, // Changed from 500 to 400 to better reflect client error scenarios
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        return addCorsHeaders(response, origin);
      }

      const response = new Response(JSON.stringify({
        report: reportType,
        params,
        generated_at: new Date().toISOString(),
        data: result.data,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      return addCorsHeaders(response, origin);
    }

    const response = new Response("Not found", { status: 404, headers: corsHeaders });
    return addCorsHeaders(response, origin);
  } catch (err) {
    console.error("Unhandled exception in function", err);
    const response = new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
    return addCorsHeaders(response, origin);
  }
});