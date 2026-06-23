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

const chunkedKey = (key, part) => `chunked:${key}:${part}`;

const readSingleValue = async key => {
  const result = await supabaseFetch(
    `?select=key,value,updated_at&key=eq.${encodeURIComponent(key)}&limit=1`
  );

  if (!result.ok) return result;

  const row = Array.isArray(result.data) ? result.data[0] : null;
  return {ok: true, status: 200, data: row};
};

const upsertSingleValue = async (key, value) => supabaseFetch("", {
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

const deleteSingleValue = async key => supabaseFetch(`?key=eq.${encodeURIComponent(key)}`, {
  method: "DELETE"
});

const readChunkedMeta = async key => {
  const meta = await readSingleValue(chunkedKey(key, "meta"));
  if (!meta.ok) return meta;
  if (!meta.data?.value) return {ok: true, status: 200, data: null};
  return {ok: true, status: 200, data: JSON.parse(meta.data.value)};
};

const readChunkValue = async (key, index) => {
  const result = await readSingleValue(chunkedKey(key, `chunk:${index}`));
  if (!result.ok) return result;
  if (typeof result.data?.value !== "string") {
    return {ok: false, status: 404, data: {error: "Chunk not found", chunk: index}};
  }
  return {ok: true, status: 200, data: result.data.value};
};

const readChunkedValue = async key => {
  const metaResult = await readChunkedMeta(key);
  if (!metaResult.ok) return metaResult;
  const meta = metaResult.data;
  if (!meta) return {ok: true, status: 200, data: null};

  const parts = [];
  for (let index = 0; index < meta.chunks; index += 1) {
    const chunk = await readChunkValue(key, index);
    if (!chunk.ok) return chunk;
    parts.push(chunk.data || "");
  }

  return {ok: true, status: 200, data: {value: parts.join(""), meta}};
};

const writeChunkedValue = async (key, value, maxChars = 750000) => {
  const oldMeta = await readChunkedMeta(key);
  if (!oldMeta.ok) return oldMeta;

  const chunks = splitValueForResponse(value, maxChars);
  for (let index = 0; index < chunks.length; index += 1) {
    const saved = await upsertSingleValue(chunkedKey(key, `chunk:${index}`), chunks[index]);
    if (!saved.ok) return saved;
  }

  const meta = {
    chunks: chunks.length,
    length: value.length,
    updatedAt: new Date().toISOString()
  };
  const savedMeta = await upsertSingleValue(chunkedKey(key, "meta"), JSON.stringify(meta));
  if (!savedMeta.ok) return savedMeta;

  const previousChunks = oldMeta.data?.chunks || 0;
  for (let index = chunks.length; index < previousChunks; index += 1) {
    await deleteSingleValue(chunkedKey(key, `chunk:${index}`));
  }

  return {ok: true, status: 200, data: meta};
};

const readArrayStorageValue = async key => {
  if (key === "agrifut-a9") {
    const chunked = await readChunkedValue(key);
    if (!chunked.ok) return chunked;
    if (chunked.data) return {ok: true, status: 200, data: {value: chunked.data.value, source: "chunked"}};
  }

  const legacy = await readSingleValue(key);
  if (!legacy.ok) return legacy;
  const value = legacy.data?.value || "[]";

  if (key === "agrifut-a9") {
    const migrated = await writeChunkedValue(key, value);
    if (!migrated.ok) return migrated;
  }

  return {ok: true, status: 200, data: {value, source: "legacy"}};
};

const mutateStoredArray = async (key, mutation) => {
  const encodedKey = encodeURIComponent(key);

  if (key === "agrifut-a9") {
    const current = await readArrayStorageValue(key);
    if (!current.ok) return current;
    const parsed = current.data?.value ? JSON.parse(current.data.value) : [];
    const nextValue = JSON.stringify(mutateArrayValue(parsed, mutation));
    const saved = await writeChunkedValue(key, nextValue);
    if (!saved.ok) return saved;
    return {ok: true, status: 200, data: {key}};
  }

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
      if (key === "agrifut-a9") {
        const requestedChunk = event.queryStringParameters?.chunk;
        const metaResult = await readChunkedMeta(key);
        if (!metaResult.ok) return response(metaResult.status, metaResult.data);

        if (metaResult.data) {
          if (requestedChunk === undefined) {
            return response(200, {
              key,
              chunked: true,
              chunks: metaResult.data.chunks,
              length: metaResult.data.length,
              storage: "chunked"
            });
          }

          const index = Number(requestedChunk);
          if (!Number.isInteger(index) || index < 0 || index >= metaResult.data.chunks) {
            return response(400, {error: "Invalid chunk"});
          }

          const chunk = await readChunkValue(key, index);
          if (!chunk.ok) return response(chunk.status, chunk.data);
          return response(200, {
            key,
            value: chunk.data || "",
            chunk: index,
            chunks: metaResult.data.chunks
          });
        }
      }

      const result = await supabaseFetch(
        `?select=key,value&key=eq.${encodedKey}&limit=1`
      );

      if (!result.ok) return response(result.status, result.data);

      const row = Array.isArray(result.data) ? result.data[0] : null;
      if (row && key === "agrifut-a9") {
        const storedValue = row.value || "[]";
        const migrated = await writeChunkedValue(key, storedValue);
        if (!migrated.ok) return response(migrated.status, migrated.data);
        const requestedChunk = event.queryStringParameters?.chunk;

        if (requestedChunk === undefined) {
          return response(200, {
            key,
            chunked: true,
            chunks: migrated.data.chunks,
            length: migrated.data.length,
            storage: "migrated"
          });
        }

        const index = Number(requestedChunk);
        if (!Number.isInteger(index) || index < 0 || index >= migrated.data.chunks) {
          return response(400, {error: "Invalid chunk"});
        }

        const chunk = await readChunkValue(key, index);
        if (!chunk.ok) return response(chunk.status, chunk.data);
        return response(200, {
          key,
          value: chunk.data || "",
          chunk: index,
          chunks: migrated.data.chunks
        });
      }
      return response(200, row ? { key: row.key, value: row.value } : null);
    }

    if (event.httpMethod === "POST") {
      if (key === "agrifut-a9" && event.queryStringParameters?.chunked === "1") {
        const body = JSON.parse(event.body || "{}");
        const chunk = Number(body.chunk);
        const chunks = Number(body.chunks);
        const length = Number(body.length || 0);

        if (!Number.isInteger(chunk) || !Number.isInteger(chunks) || chunk < 0 || chunks < 1 || chunk >= chunks) {
          return response(400, { error: "Invalid chunk info" });
        }

        if (typeof body.value !== "string") {
          return response(400, { error: "Missing chunk value" });
        }

        const saved = await upsertSingleValue(chunkedKey(key, `chunk:${chunk}`), body.value);
        if (!saved.ok) return response(saved.status, saved.data);

        const meta = {
          chunks,
          length,
          updatedAt: new Date().toISOString(),
          source: "seed"
        };
        const savedMeta = await upsertSingleValue(chunkedKey(key, "meta"), JSON.stringify(meta));
        if (!savedMeta.ok) return response(savedMeta.status, savedMeta.data);

        return response(200, { key, chunk, chunks });
      }

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
