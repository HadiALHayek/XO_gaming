import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
