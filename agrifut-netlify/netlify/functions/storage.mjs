const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
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

const mutateArrayValue = (current, mutation) => {
  const list = Array.isArray(current) ? current : [];
  const idOf = value => String(value ?? "");

  if (mutation.action === "upsert" && mutation.item) {
    const index = list.findIndex(item => idOf(item?.id) === idOf(mutation.item.id));
    if (index === -1) return [...list, mutation.item];
    return list.map((item, i) => i === index ? mutation.item : item);
  }

  if (mutation.action === "patch" && mutation.id !== undefined && mutation.patch) {
    return list.map(item => idOf(item?.id) === idOf(mutation.id) ? {...item, ...mutation.patch} : item);
  }

  if (mutation.action === "delete" && mutation.id !== undefined) {
    return list.filter(item => idOf(item?.id) !== idOf(mutation.id));
  }

  throw new Error("Invalid array mutation");
};

const splitValueForResponse = (value, maxChars = 2500000) => {
  const chunks = [];
  for (let start = 0; start < value.length; start += maxChars) {
    chunks.push(value.slice(start, start + maxChars));
  }
  if (!chunks.length) chunks.push("");
  return chunks;
};

const mutateStoredArray = async (key, mutation) => {
  const encodedKey = encodeURIComponent(key);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await supabaseFetch(
      `?select=key,value,updated_at&key=eq.${encodedKey}&limit=1`
    );

    if (!current.ok) return current;

    const row = Array.isArray(current.data) ? current.data[0] : null;
    const parsed = row?.value ? JSON.parse(row.value) : [];
    const nextValue = JSON.stringify(mutateArrayValue(parsed, mutation));
    const updatedAt = new Date().toISOString();

    if (!row) {
      const created = await supabaseFetch("", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({key, value: nextValue, updated_at: updatedAt})
      });
      if (created.ok) return {ok: true, status: 200, data: {key}};
      continue;
    }

    const result = await supabaseFetch(
      `?key=eq.${encodedKey}&updated_at=eq.${encodeURIComponent(row.updated_at)}`,
      {
        method: "PATCH",
        headers: {Prefer: "return=representation"},
        body: JSON.stringify({value: nextValue, updated_at: updatedAt})
      }
    );

    if (!result.ok) return result;
    if (Array.isArray(result.data) && result.data.length > 0) {
      return {ok: true, status: 200, data: {key}};
    }
  }

  return {ok: false, status: 409, data: {error: "Concurrent update conflict"}};
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
      if (row && key === "agrifut-a9") {
        const storedValue = row.value || "[]";
        const chunks = splitValueForResponse(storedValue);
        const requestedChunk = event.queryStringParameters?.chunk;

        if (requestedChunk === undefined) {
          return response(200, {
            key,
            chunked: true,
            chunks: chunks.length,
            length: storedValue.length
          });
        }

        const index = Number(requestedChunk);
        if (!Number.isInteger(index) || index < 0 || index >= chunks.length) {
          return response(400, {error: "Invalid chunk"});
        }

        return response(200, {
          key,
          value: chunks[index],
          chunk: index,
          chunks: chunks.length
        });
      }
      return response(200, row ? { key: row.key, value: row.value } : null);
    }

    if (event.httpMethod === "POST") {
      if (key === "agrifut-a9") {
        return response(409, {error: "Athletes must be updated with PATCH"});
      }

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

    if (event.httpMethod === "PATCH") {
      const body = JSON.parse(event.body || "{}");
      const result = await mutateStoredArray(key, body);

      if (!result.ok) return response(result.status, result.data);
      return response(200, result.data);
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
