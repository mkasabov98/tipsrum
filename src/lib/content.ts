import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";

/**
 * Page copy ported from the WordPress site. The fragments were sanitised at import
 * time (whitelisted tags, attributes stripped except link hrefs), so they are safe
 * to render as HTML; nothing here is user input.
 *
 * Read from disk rather than bundled: the app is deployed from source via Nixpacks,
 * so the files are present at runtime. Cached per request.
 */
export const getPageContent = cache((slug: string): string => {
  const path = join(process.cwd(), "src", "content", `${slug}.html`);
  try {
    return readFileSync(path, "utf8");
  } catch {
    throw new Error(`Missing page content: src/content/${slug}.html`);
  }
});
