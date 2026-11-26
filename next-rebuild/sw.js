const VERSION = "tiknation-next-v115";
const SHELL = ["./", "./index.html", "./sign-out.html", "./sign-in.html", "./manifest.webmanifest", "./icon-192.svg", "./icon-512.svg", "./verification-center.html", "./child-safety-advocates.html", "./child-safety-training.html", "./child-safety-volunteer-program.html", "./child-safety-volunteer-apply.html", "./child-safety-volunteer-orientation.html", "./child-safety-volunteer-voice-studio.html", "./child-safety-command-center.html", "./synthetic-camera-studio.html", "./age-check.html", "./safety-center.html","./account-recovery.html","./community-guidelines.html","./appeals.html","./notification-preferences.html","./privacy-center.html","./content-preferences.html","./security.html","./session-activity.html","./live-worlds.html","./creator-wallet.html","./live-guest-battles.html","./live-creator-access.html","./live-moderation.html","./creator-analytics.html","./gift-engine.js","./gifts.js","./icons/tiknation.svg"];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("tiknation-next-") && key !== VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const response = await fetch(request, {cache:"no-store"});
        if (response && response.ok) cache.put("./index.html", response.clone());
        return response;
      } catch (_) {
        return (await cache.match(request)) || (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});

// Receive future Web Push messages and display them even when the app is closed.
self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = typeof payload.title === "string" && payload.title.trim()
    ? payload.title.trim().slice(0, 80)
    : "TikNation";
  const body = typeof payload.body === "string"
    ? payload.body.trim().slice(0, 180)
    : "You have a new update.";
  let target = "./index.html";
  try {
    const candidate = new URL(
      typeof payload.url === "string" ? payload.url : "./index.html",
      self.location.origin
    );
    if (candidate.origin === self.location.origin) {
      target = candidate.pathname + candidate.search + candidate.hash;
    }
  } catch (_) {}

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "./icon-192.svg",
    badge: "./icon-192.svg",
    tag: typeof payload.tag === "string" ? payload.tag.slice(0, 100) : "tiknation-update",
    renotify: false,
    data: { url: target }
  }));
});

// Keep notification taps inside TikNation and focus an existing app window.
self.addEventListener("notificationclick", event => {
  event.notification.close();
  let target = "./index.html";
  try {
    const candidate = new URL(
      event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : "./index.html",
      self.location.origin
    );
    if (candidate.origin === self.location.origin) {
      target = candidate.href;
    }
  } catch (_) {
    target = new URL("./index.html", self.location.origin).href;
  }

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        if ("navigate" in client) await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
