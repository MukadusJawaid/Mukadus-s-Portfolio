import type { MetadataRoute } from "next";
import { site } from "@/features/seo/site";

// One page, so one entry. No changing timestamp, which keeps this route static.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "monthly", priority: 1 }];
}
