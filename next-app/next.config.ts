import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
