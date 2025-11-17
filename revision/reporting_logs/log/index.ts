import { createClient } from "npm:@supabase/supabase-js@2.33.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001"
];
function getCorsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "Access-Control-Max-Age": "600"
  };
  if (allowed) {
    headers["Access-Control-Allow-Origin"] = allowed;
  } else {
    headers["Access-Control-Allow-Origin"] = "null";
  }
  return headers;
}
// Helper function to ensure all responses include CORS headers
function addCorsHeaders(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value])=>{
    response.headers.set(key, value);
  });
  return response;
}
// --- Simple in-memory caches and limiter (per-edge-instance) ---
const roleCache = new Map();
const ROLE_CACHE_TTL_MS = 60 * 1000; // 60s
const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_BURST = 10; // max tokens
const RATE_REFILL_INTERVAL_MS = 6000; // add 1 token every 6s
const RATE_REFILL_AMOUNT = 1;
function rateAllow(userKey) {
  const now = Date.now();
  let st = RATE_LIMIT_MAP.get(userKey);
  if (!st) {
    st = {
      tokens: RATE_LIMIT_BURST,
      lastRefill: now
    };
    RATE_LIMIT_MAP.set(userKey, st);
  }
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
function isISODateString(s) {
  if (!s || typeof s !== "string") return false;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}
function parseDateOrNull(s) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
async function validateJWTAndRole(authHeader) {
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
      return {
        user_id: user.id,
        is_admin: cached.is_admin,
        role: cached.role
      };
    }
    let roleClaim = null;
    try {
      roleClaim = user.user_metadata && user.user_metadata.role || user.app_metadata && user.app_metadata.role || null;
    } catch (e) {
      roleClaim = null;
    }
    let isAdmin = false;
    if (roleClaim && (roleClaim === "admin" || roleClaim === "administrator")) {
      isAdmin = true;
    } else {
      const { data: dbUser, error: dbErr } = await svc.from("users").select("role").eq("id", user.id).maybeSingle();
      if (!dbErr && dbUser && (dbUser.role === "admin" || dbUser.role === "administrator")) {
        isAdmin = true;
        roleClaim = dbUser.role;
      }
    }
    const cacheVal = {
      is_admin: isAdmin,
      role: roleClaim ?? undefined,
      expires: Date.now() + ROLE_CACHE_TTL_MS
    };
    roleCache.set(user.id, cacheVal);
    return {
      user_id: user.id,
      is_admin: isAdmin,
      role: cacheVal.role ?? null
    };
  } catch (err) {
    console.error("validateJWTAndRole error", err);
    return null;
  }
}
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
  return {
    start: startPrev.toISOString(),
    end: endPrev.toISOString()
  };
}
async function callRpcSafe(name, params) {
  try {
    const { data, error } = await svc.rpc(name, params);
    if (error) {
      console.error("RPC error", name, error);
      return {
        error: error.message || "rpc_error",
        data: null
      };
    }
    return {
      error: null,
      data
    };
  } catch (err) {
    console.error("RPC call exception", name, err);
    return {
      error: err?.message ?? "rpc_exception",
      data: null
    };
  }
}
async function generateTopProducts(params, userId) {
  let from, to;
  if (params?.period === "last_week" || !params?.from && !params?.to) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return {
      error: "invalid_dates",
      data: null
    };
  }
  const limit = Math.min(100, params?.limit ? Number(params.limit) || 3 : 3);
  const storeId = params?.store_id || null;
  const rpcName = "reports.top_products";
  const rpcParams = {
    p_from: from,
    p_to: to,
    p_store_id: storeId,
    p_limit: limit
  };
  const res = await callRpcSafe(rpcName, rpcParams);
  if (userId) {
    (async ()=>{
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "top_products",
          params,
          format: "json",
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("report_requests insert failed", e?.message ?? e);
      }
    })();
  }
  return res;
}
async function generateSalesByCategory(params, userId) {
  let from, to;
  if (params?.period === "last_week" || !params?.from && !params?.to) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return {
      error: "invalid_dates",
      data: null
    };
  }
  const storeId = params?.store_id || null;
  const res = await callRpcSafe("reports.sales_by_category", {
    p_from: from,
    p_to: to,
    p_store_id: storeId
  });
  if (userId) {
    (async ()=>{
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "sales_by_category",
          params,
          format: "json",
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("report_requests insert failed", e?.message ?? e);
      }
    })();
  }
  return res;
}
async function generateSalesSummary(params, userId) {
  let from, to;
  if (params?.period === "last_week" || !params?.from && !params?.to) {
    const r = isoWeekRangeForPreviousWeek();
    from = r.start;
    to = r.end;
  } else {
    from = parseDateOrNull(params?.from) ?? params?.from;
    to = parseDateOrNull(params?.to) ?? params?.to;
    if (!from || !to) return {
      error: "invalid_dates",
      data: null
    };
  }
  const storeId = params?.store_id || null;
  const res = await callRpcSafe("reports.sales_summary", {
    p_from: from,
    p_to: to,
    p_store_id: storeId
  });
  if (userId) {
    (async ()=>{
      try {
        await svc.from("report_requests").insert({
          requested_by: userId,
          report_name: "sales_summary",
          params,
          format: "json",
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("report_requests insert failed", e?.message ?? e);
      }
    })();
  }
  return res;
}
console.info("Reporting function initialized");
Deno.serve(async (req)=>{
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      const response = new Response(JSON.stringify({
        error: "method_not_allowed"
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    const url = new URL(req.url);
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      const response = new Response(JSON.stringify({
        error: "missing_token"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    const userAuth = await validateJWTAndRole(authHeader);
    if (!userAuth) {
      const response = new Response(JSON.stringify({
        error: "invalid_token"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    const userKey = `u:${userAuth.user_id}`;
    if (!rateAllow(userKey)) {
      const response = new Response(JSON.stringify({
        error: "rate_limited"
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    if (!userAuth.is_admin) {
      const response = new Response(JSON.stringify({
        error: "forbidden",
        message: "admin role required"
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    if (url.pathname === "/reporting" && req.method === "GET") {
      const body = {
        reports: [
          {
            name: "top_products",
            description: "Productos más vendidos en un periodo",
            params: {
              period: [
                "last_week",
                "from/to"
              ],
              limit: "integer (max 100)",
              store_id: "string|null",
              format: [
                "json"
              ]
            }
          },
          {
            name: "sales_by_category",
            description: "Ventas por categoría en un periodo",
            params: {
              period: [
                "last_week",
                "from/to"
              ],
              store_id: "string|null",
              format: [
                "json"
              ]
            }
          },
          {
            name: "sales_summary",
            description: "Resumen de ventas en un periodo",
            params: {
              period: [
                "last_week",
                "from/to"
              ],
              store_id: "string|null",
              format: [
                "json"
              ]
            }
          }
        ]
      };
      const response = new Response(JSON.stringify(body), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    if (url.pathname === "/reporting/status" && req.method === "GET") {
      const response = new Response(JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        available_reports: [
          "top_products",
          "sales_by_category",
          "sales_summary"
        ]
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response, origin);
    }
    if (url.pathname === "/reporting" && req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch (e) {
        const response = new Response(JSON.stringify({
          error: "invalid_json"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      if (!body?.report) {
        const response = new Response(JSON.stringify({
          error: "report_required"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      const allowedReports = [
        "top_products",
        "sales_by_category",
        "sales_summary"
      ];
      if (!allowedReports.includes(body.report)) {
        const response = new Response(JSON.stringify({
          error: "report_not_supported"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      const params = body.params || {};
      if (params.from && !isISODateString(params.from)) {
        const response = new Response(JSON.stringify({
          error: "invalid_from_date"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      if (params.to && !isISODateString(params.to)) {
        const response = new Response(JSON.stringify({
          error: "invalid_to_date"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      if (params.limit && !(Number(params.limit) > 0)) {
        const response = new Response(JSON.stringify({
          error: "invalid_limit"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      let result;
      switch(body.report){
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
          const response = new Response(JSON.stringify({
            error: "report_not_implemented"
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
          return addCorsHeaders(response, origin);
      }
      if (result.error) {
        const response = new Response(JSON.stringify({
          error: "query_failed",
          details: result.error
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
        return addCorsHeaders(response, origin);
      }
      const response1 = new Response(JSON.stringify({
        report: body.report,
        params,
        generated_at: new Date().toISOString(),
        data: result.data
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
      return addCorsHeaders(response1, origin);
    }
    const response = new Response("Not found", {
      status: 404,
      headers: corsHeaders
    });
    return addCorsHeaders(response, origin);
  } catch (err) {
    console.error("Unhandled exception in function", err);
    const response = new Response(JSON.stringify({
      error: "internal_error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return addCorsHeaders(response, origin);
  }
});
