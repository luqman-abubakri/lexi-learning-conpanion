/*
 * Lexi PWA Service Worker (Vercel-friendly, no Next SSR interference)
 *
 * Goals (per requirements):
 * - Static Assets/Images/Logo/Icons/Fonts: cache-first
 * - Pages: stale-while-revalidate
 * - GET API: network-first
 * - Auth: network-only
 * - POST/PATCH/DELETE: never cache
 * - Never cache Clerk/Supabase auth/JWT/session/Vapi voice data
 */

const VERSION = "lexi-pwa-v1";

const CACHE = {
  static: `static-${VERSION}`,
  pages: `pages-${VERSION}`,
  images: `images-${VERSION}`,
  apiGet: `api-get-${VERSION}`,
  fonts: `fonts-${VERSION}`,
  icons: `icons-${VERSION}`,
  fallback: `fallback-${VERSION}`,
};

const OFFLINE_URL = "/offline";
const OFFLINE_FALLBACK_HTML = "/offline.html";

const isNavigationRequest = (request) => {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
};

const isAssetRequest = (requestUrl) => {
  const p = requestUrl.pathname;
  return (
    p.startsWith("/favicon") ||
    p.startsWith("/icons/") ||
    p.endsWith(".png") ||
    p.endsWith(".jpg") ||
    p.endsWith(".jpeg") ||
    p.endsWith(".webp") ||
    p.endsWith(".svg") ||
    p.endsWith(".gif") ||
    p.endsWith(".ico")
  );
};

const isFontRequest = (requestUrl) => {
  const p = requestUrl.pathname;
  return p.endsWith(".woff") || p.endsWith(".woff2") || p.endsWith(".ttf") || p.endsWith(".otf");
};

const isStaticFile = (requestUrl) => {
  const p = requestUrl.pathname;
  return (
    p.startsWith("/_next/static/") ||
    p.startsWith("/_next/image") ||
    p === "/" ||
    p.startsWith("/public/") ||
    p.endsWith(".css") ||
    p.endsWith(".js") ||
    p.endsWith(".mjs") ||
    p.endsWith(".map")
  );
};

const isIconRequest = (requestUrl) => {
  return requestUrl.pathname.startsWith("/icons/") || requestUrl.pathname === "/icon.png";
};

const isAuthRequest = (requestUrl) => {
  const p = requestUrl.pathname;
  return (
    p.startsWith("/sign-in") ||
    p.startsWith("/sign-up") ||
    p.includes("/clerk") ||
    p.includes("clerk") ||
    p.includes("supabase") ||
    p.includes("jwt")
  );
};

const isVapiRequest = (requestUrl) => {
  return requestUrl.hostname.includes("vapi") || requestUrl.pathname.includes("vapi");
};

const isSupabaseAuthEndpoint = (requestUrl) => {
  return requestUrl.pathname.includes("supabase") || requestUrl.pathname.includes("auth") || requestUrl.searchParams.has("jwt");
};

const isApiGetRequest = (request) => {
  const requestUrl = new URL(request.url);
  return request.method === "GET" && requestUrl.pathname.startsWith("/api/");
};

const shouldNeverCache = (requestUrl, method) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;
  // Auth/session/JWT sensitive
  if (isAuthRequest(requestUrl)) return true;
  if (isVapiRequest(requestUrl)) return true;
  if (isSupabaseAuthEndpoint(requestUrl)) return true;
  // Clerk endpoints (best-effort)
  if (requestUrl.hostname.includes("clerk") || requestUrl.pathname.includes("clerk")) return true;
  // Supabase JS endpoints (best-effort)
  if (requestUrl.hostname.includes("supabase") && requestUrl.pathname.includes("auth")) return true;
  return false;
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // Pre-cache deterministic offline fallback HTML.
      const cache = await caches.open(CACHE.fallback);
      try {
        await cache.add(new Request(OFFLINE_FALLBACK_HTML, { cache: "reload" }));
      } catch {
        // ignore
      }
      // Best-effort: also cache the Next route (may not be fetchable before first navigation).
      try {
        await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      } catch {
        // ignore
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (!Object.values(CACHE).includes(k)) return caches.delete(k);
        })
      );
      await self.clients.claim();

      // Notify clients so UI can show “update available”.
      try {
        const allClients = await self.clients.matchAll({ type: "window" });
        for (const client of allClients) {
          client.postMessage({ type: "LEXI_SW_UPDATED" });
        }
      } catch {
        // ignore
      }
    })()
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  // Only cache successful responses
  if (fresh && fresh.ok) {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = (async () => {
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) {
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch {
      return null;
    }
  })();

  if (cached) {
    // Return cached immediately, update in background
    fetchPromise.catch(() => {});
    return cached;
  }

  const fresh = await fetchPromise;
  if (fresh) return fresh;
  throw new Error("No cached response");
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (shouldNeverCache(requestUrl, request.method)) {
    // Auth/network sensitive or non-GET
    event.respondWith(fetch(request));
    return;
  }

  // Handle navigation pages
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          return await staleWhileRevalidate(request, CACHE.pages);
        } catch {
          // offline fallback
          const cache = await caches.open(CACHE.fallback);
          const cached =
            (await cache.match(OFFLINE_URL)) ||
            (await cache.match(OFFLINE_FALLBACK_HTML));
          return (
            cached ||
            new Response("Offline", {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })()
    );
    return;
  }

  // GET API requests: Network First
  if (isApiGetRequest(request)) {
    event.respondWith(networkFirst(request, CACHE.apiGet).catch(() => caches.match(request)));
    return;
  }

  // Static assets (CSS/JS/_next/static) cache-first
  if (isStaticFile(requestUrl)) {
    event.respondWith(cacheFirst(request, CACHE.static));
    return;
  }

  // Icons cache-first
  if (isIconRequest(requestUrl)) {
    event.respondWith(cacheFirst(request, CACHE.icons));
    return;
  }

  // Fonts cache-first
  if (isFontRequest(requestUrl)) {
    event.respondWith(cacheFirst(request, CACHE.fonts));
    return;
  }

  // Images cache-first
  if (isAssetRequest(requestUrl)) {
    event.respondWith(cacheFirst(request, CACHE.images));
    return;
  }

  // Default: network
  // Avoid interfering with unknown/dynamic resources.
  event.respondWith(fetch(request));
});

