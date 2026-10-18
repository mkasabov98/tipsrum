import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // A staging deployment sets SITE_NOINDEX=1 so search engines never list it
  // next to the real site.
  async headers() {
    if (process.env.SITE_NOINDEX !== "1") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // The truncated percent-encoded Cyrillic slug WordPress generated for one
      // article is redirected in src/app/[slug]/page.tsx instead: a source here
      // never matches it, because Next compares the still-encoded pathname.
      //
      // The live site had two pages for the free plan and called the premium one
      // /pro in places. One page each now, with the old paths pointing at it.
      { source: "/bezplaten", destination: "/free", permanent: true },
      { source: "/pro", destination: "/premium", permanent: true },
    ];
  },
};

export default nextConfig;
