type StorageResult = {
  key: string;
  value: string;
};

type BrowserStorage = {
  get: (key: string) => Promise<StorageResult | null>;
  set: (key: string, value: string) => Promise<StorageResult>;
  delete: (key: string) => Promise<{ key: string }>;
};

declare global {
  interface Window {
    storage?: BrowserStorage;
  }
}

if (typeof window !== "undefined" && !window.storage) {
  const localStorageApi: BrowserStorage = {
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
    }
  };

  const canUseServerStorage = () => {
    const host = window.location.hostname;
    return host !== "localhost" && host !== "127.0.0.1" && host !== "";
  };

  const callServerStorage = async (
    method: "GET" | "POST" | "DELETE",
    key: string,
    value?: string
  ) => {
    const url = `/.netlify/functions/storage?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ value }) : undefined
    });

    if (!response.ok) {
      throw new Error(`Server storage failed: ${response.status}`);
    }

    return response.json();
  };

  window.storage = {
    async get(key) {
      if (!canUseServerStorage()) return localStorageApi.get(key);
      try {
        return await callServerStorage("GET", key);
      } catch (error) {
        console.warn("Using localStorage fallback:", error);
        return localStorageApi.get(key);
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
    }
  };
}

export {};
