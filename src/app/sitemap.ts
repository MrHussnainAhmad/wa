import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/boards`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/quote`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await connectDB();
    const boards = await Board.find().select("_id updatedAt").lean();
    const boardRoutes: MetadataRoute.Sitemap = boards.map((b) => ({
      url: `${base}/boards/${b._id}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...boardRoutes];
  } catch {
    return staticRoutes;
  }
}
