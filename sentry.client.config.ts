import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.3 : 1.0,

  // Session Replay for debugging user issues
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter sensitive data before sending
  beforeSend(event) {
    // Strip query params that might contain tokens
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        url.searchParams.delete("token");
        url.searchParams.delete("key");
        url.searchParams.delete("secret");
        event.request.url = url.toString();
      } catch {}
    }

    // Strip Authorization headers
    if (event.request?.headers) {
      delete event.request.headers["Authorization"];
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }

    return event;
  },

  // Only capture errors from our domain
  allowUrls: [/localhost/, /vercel\.app/, /tripcraft/],

  // Ignore common noisy errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error exception captured",
    "Load failed",
    "Failed to fetch",
  ],

  debug: false,
});
