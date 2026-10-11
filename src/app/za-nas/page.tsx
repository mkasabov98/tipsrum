import type { Metadata } from "next";

import { PageShell } from "@/components/site/page-shell";
import { Prose } from "@/components/site/prose";
import { getPageContent } from "@/lib/content";

const TITLE = "За нас";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
};

export default function Page() {
  return (
    <PageShell
      title={TITLE}
      lead="Екип от експерти и ентусиасти в спортните прогнози, специализирани в конните надбягвания."
    >
      <Prose html={getPageContent("za-nas")} />
    </PageShell>
  );
}
