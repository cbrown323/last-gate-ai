import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid picking up ~/package-lock.json as the workspace root in dev.
    root: projectRoot,
  },
};

export default nextConfig;
