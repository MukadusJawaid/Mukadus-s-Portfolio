import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a production build can go to its own folder (NEXT_DIST_DIR=.next-prod), so it never clashes with the running dev server
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Not using cacheComponents: it keeps the previous page alive but hidden (React Activity), so the website, its embedded
  // previews and the 3D desk would keep running in the background after you navigate away.
  // The stylesheet is small, so it goes inside the HTML: no separate request blocks the first paint.
  experimental: { inlineCss: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
