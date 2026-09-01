import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/my-trips(.*)",
  "/expense-tracker(.*)",
  "/wishlist(.*)",
  "/trip-planner(.*)",
  "/api/trips/save(.*)",
  "/api/trips/generate(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Enforce authentication on protected user routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Enforce authentication on admin routes
  // Note: Role-based access control (RBAC) is enforced at the layout/API level:
  // - Pages: src/app/admin/layout.tsx calls requireAdmin() which checks DB role
  // - API routes: withAdminAuth() wrapper in src/lib/adminAuth.ts verifies DB role
  // Middleware only ensures the user is authenticated; role checks require DB access.
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

// Security headers are configured in next.config.ts headers() to avoid conflicts.
// Do NOT add CSP, X-Frame-Options, etc. here — they would duplicate and conflict.

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

