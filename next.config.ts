import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/plan',
        destination: '/trip-planner',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "rudrarao-maker",
  project: "ai-tripplanner",
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: true,
  },
  disableLogger: true,
  automaticVercelMonitors: true,
});
