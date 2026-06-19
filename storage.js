if (!window.storage) {
  const localStorageApi = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value === null ? null : { key, value };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      window.localStorage.removeItem(key);
      return { key };
    },
    async mutateArray(key, mutation) {
      const current = JSON.parse(window.localStorage.getItem(key) || "[]");
      const idOf = value => String(value ?? "");
      let next = Array.isArray(current) ? current : [];

      if (mutation.action === "upsert" && mutation.item) {
        const exists = next.some(item => idOf(item?.id) === idOf(mutation.item.id));
        next = exists
          ? next.map(item => idOf(item?.id) === idOf(mutation.item.id) ? mutation.item : item)
          : [...next, mutation.item];
      } else if (mutation.action === "patch" && mutation.id !== undefined && mutation.patch) {
        next = next.map(item => idOf(item?.id) === idOf(mutation.id) ? {...item, ...mutation.patch} : item);
      } else if (mutation.action === "delete" && mutation.id !== undefined) {
        next = next.filter(item => idOf(item?.id) !== idOf(mutation.id));
      } else {
        throw new Error("Invalid array mutation");
      }

      window.localStorage.setItem(key, JSON.stringify(next));
      return { key };
    }
  };

  const canUseServerStorage = () => {
    const host = window.location.hostname;
    return host !== "localhost" && host !== "127.0.0.1" && host !== "";
  };

  const callServerStorage = async (method, key, value) => {
    const baseUrl = `/.netlify/functions/storage?key=${encodeURIComponent(key)}`;
    const request = async url => {
      let lastError;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: method === "POST" ? JSON.stringify({ value }) : undefined
          });

          if (!response.ok) {
            throw new Error(`Server storage failed: ${response.status}`);
          }

          return response.json();
        } catch (error) {
          lastError = error;
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
        }
      }

      throw lastError;
    };

    const result = await request(baseUrl);
    if (method !== "GET" || !result?.chunked) return result;

    const chunks = await Promise.all(
      Array.from({length: result.chunks}, (_, index) => request(`${baseUrl}&chunk=${index}`))
    );
    const parts = chunks.map(chunk => chunk.value || "");

    return { key, value: parts.join("") };
  };

  window.storage = {
    async get(key) {
      if (!canUseServerStorage()) return localStorageApi.get(key);
      try {
        const result = await callServerStorage("GET", key);
        if (result?.value) {
          try {
            await localStorageApi.set(key, result.value);
          } catch (cacheError) {
            console.warn("Local cache unavailable; using server data:", cacheError);
          }
        }
        return result;
      } catch (error) {
        console.warn("Using localStorage fallback:", error);
        const fallback = await localStorageApi.get(key);
        if (key === "agrifut-a9") {
          try {
            const parsed = fallback ? JSON.parse(fallback.value) : [];
            if (!Array.isArray(parsed) || parsed.length === 0) throw error;
          } catch (fallbackError) {
            throw error;
          }
        }
        return fallback;
      }
    },
    async set(key, value) {
      if (!canUseServerStorage()) return localStorageApi.set(key, value);
      try {
        return await callServerStorage("POST", key, value);
      } catch (error) {
        console.warn("Using localStorage fallback:", error);
        return localStorageApi.set(key, value);
      }
    },
    async delete(key) {
      if (!canUseServerStorage()) return localStorageApi.delete(key);
      try {
        return await callServerStorage("DELETE", key);
      } catch (error) {
        console.warn("Using localStorage fallback:", error);
        return localStorageApi.delete(key);
      }
    },
    async mutateArray(key, mutation) {
      if (!canUseServerStorage()) return localStorageApi.mutateArray(key, mutation);
      const response = await fetch(
        `/.netlify/functions/storage?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutation)
        }
      );

      if (!response.ok) {
        throw new Error(`Server array mutation failed: ${response.status}`);
      }

      const result = await response.json();
      try {
        await localStorageApi.mutateArray(key, mutation);
      } catch (cacheError) {
        console.warn("Local cache unavailable after server save:", cacheError);
      }
      return result;
    }
  };
}
