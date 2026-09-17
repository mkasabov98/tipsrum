import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * The authoritative session check for server components. Cached per request so a
 * layout and a page can both call it with a single database lookup.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
