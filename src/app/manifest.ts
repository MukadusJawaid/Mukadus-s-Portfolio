import type { MetadataRoute } from "next";
import { site } from "@/features/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} | Portfolio`,
    short_name: site.name.split(" ")[0],
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
