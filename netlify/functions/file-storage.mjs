const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Cache-Control": "no-store"
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {...baseHeaders, "Content-Type": "application/json"},
  body: JSON.stringify(body)
});

const fileResponse = (statusCode, body, headers = {}, isBase64Encoded = false) => ({
  statusCode,
  headers: {...baseHeaders, ...headers},
  body,
  isBase64Encoded
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

const storageKey = (key, part) => `file:${key}:${part}`;
const encodeEq = value => encodeURIComponent(value);
const safeName = value => String(value || "documento").replace(/[\r\n"]/g, "").slice(0, 160);

const upsertValue = async (key, value) => supabaseFetch("", {
  method: "POST",
  headers: {
    Prefer: "resolution=merge-duplicates,return=minimal"
  },
  body: JSON.stringify({
    key,
    value,
    updated_at: new Date().toISOString()
  })
});

const readValue = async key => {
  const result = await supabaseFetch(`?select=key,value&key=eq.${encodeEq(key)}&limit=1`);
  if (!result.ok) return result;
  const row = Array.isArray(result.data) ? result.data[0] : null;
  return {ok: true, status: 200, data: row ? row.value : null};
};

const deleteValue = async key => supabaseFetch(`?key=eq.${encodeEq(key)}`, {
  method: "DELETE"
});

const parseDataUrl = value => {
  const match = String(value || "").match(/^data:([^;,]+)?;base64,(.*)$/s);
  if (!match) return null;
  return {
    mime: match[1] || "application/octet-stream",
    base64: match[2]
  };
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }

  const key = event.queryStringParameters?.key;
  if (!key) return jsonResponse(400, { error: "Missing key" });

  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const chunk = Number(body.chunk);
      const chunks = Number(body.chunks);

      if (!Number.isInteger(chunk) || !Number.isInteger(chunks) || chunk < 0 || chunks < 1 || chunk >= chunks) {
        return jsonResponse(400, { error: "Invalid chunk info" });
      }

      if (typeof body.value !== "string") {
        return jsonResponse(400, { error: "Missing chunk value" });
      }

      const meta = {
        name: body.name || "documento",
        type: body.type || "application/octet-stream",
        size: Number(body.size || 0),
        chunks,
        updatedAt: new Date().toISOString()
      };

      const chunkResult = await upsertValue(storageKey(key, `chunk:${chunk}`), body.value);
      if (!chunkResult.ok) return jsonResponse(chunkResult.status, chunkResult.data);

      const metaResult = await upsertValue(storageKey(key, "meta"), JSON.stringify(meta));
      if (!metaResult.ok) return jsonResponse(metaResult.status, metaResult.data);

      return jsonResponse(200, { key, chunk, chunks });
    }

    if (event.httpMethod === "GET") {
      const metaResult = await readValue(storageKey(key, "meta"));
      if (!metaResult.ok) return jsonResponse(metaResult.status, metaResult.data);
      if (!metaResult.data) return jsonResponse(404, { error: "File not found" });

      const meta = JSON.parse(metaResult.data);
      const parts = [];
      for (let index = 0; index < meta.chunks; index += 1) {
        const chunkResult = await readValue(storageKey(key, `chunk:${index}`));
        if (!chunkResult.ok) return jsonResponse(chunkResult.status, chunkResult.data);
        if (typeof chunkResult.data !== "string") {
          return jsonResponse(404, { error: "File chunk not found", chunk: index });
        }
        parts.push(chunkResult.data);
      }

      const dataUrl = parts.join("");
      const parsed = parseDataUrl(dataUrl);
      if (!parsed) return jsonResponse(500, { error: "Invalid stored file" });

      const name = safeName(meta.name);
      const disposition = event.queryStringParameters?.download === "1" ? "attachment" : "inline";
      return fileResponse(200, parsed.base64, {
        "Content-Type": meta.type || parsed.mime,
        "Content-Disposition": `${disposition}; filename="${name}"`
      }, true);
    }

    if (event.httpMethod === "DELETE") {
      const metaResult = await readValue(storageKey(key, "meta"));
      if (!metaResult.ok) return jsonResponse(metaResult.status, metaResult.data);
      if (metaResult.data) {
        const meta = JSON.parse(metaResult.data);
        for (let index = 0; index < meta.chunks; index += 1) {
          await deleteValue(storageKey(key, `chunk:${index}`));
        }
      }
      await deleteValue(storageKey(key, "meta"));
      return jsonResponse(200, { key });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (error) {
    return jsonResponse(500, { error: error.message || "File storage error" });
  }
}
