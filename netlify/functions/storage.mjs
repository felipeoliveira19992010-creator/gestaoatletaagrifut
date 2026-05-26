const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json"
};

const response = (statusCode, body) => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify(body)
});

const getConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1/app_storage`,
    key
  };
};

const supabaseFetch = async (path, options = {}) => {
  const { restUrl, key } = getConfig();
  const res = await fetch(`${restUrl}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }

  return { ok: true, status: res.status, data };
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return response(200, { ok: true });
  }

  const key = event.queryStringParameters?.key;

  if (!key) {
    return response(400, { error: "Missing key" });
  }

  try {
    const encodedKey = encodeURIComponent(key);

    if (event.httpMethod === "GET") {
      const result = await supabaseFetch(
        `?select=key,value&key=eq.${encodedKey}&limit=1`
      );

      if (!result.ok) return response(result.status, result.data);

      const row = Array.isArray(result.data) ? result.data[0] : null;
      return response(200, row ? { key: row.key, value: row.value } : null);
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");

      if (typeof body.value !== "string") {
        return response(400, { error: "Body must include a string value" });
      }

      const result = await supabaseFetch("", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({
          key,
          value: body.value,
          updated_at: new Date().toISOString()
        })
      });

      if (!result.ok) return response(result.status, result.data);

      const row = Array.isArray(result.data) ? result.data[0] : null;
      return response(200, row ? { key: row.key, value: row.value } : { key, value: body.value });
    }

    if (event.httpMethod === "DELETE") {
      const result = await supabaseFetch(`?key=eq.${encodedKey}`, {
        method: "DELETE"
      });

      if (!result.ok) return response(result.status, result.data);

      return response(200, { key });
    }

    return response(405, { error: "Method not allowed" });
  } catch (error) {
    return response(500, { error: error.message || "Storage error" });
  }
}
