import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { utilityTools } from "@/lib/utility-tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.6 },
    { path: "/privacy", priority: 0.6 },
    { path: "/feedback", priority: 0.5 },
    ...utilityTools.map(({ slug }) => ({
      path: `/tools/${slug}`,
      priority: 0.9,
    })),
  ];

  return routes.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
