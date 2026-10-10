import type { Metadata } from "next";

import { PageShell } from "@/components/site/page-shell";
import { Prose } from "@/components/site/prose";
import { getPageContent } from "@/lib/content";

const TITLE = "Политика за бисквитките";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
};

export default function Page() {
  return (
    <PageShell
      title={TITLE}
      eyebrow="Бисквитки"
      crumbs={[
        { href: "/", label: "Начало" },
        { href: "/politika-za-biskvitkite", label: TITLE },
      ]}
    >
      <Prose html={getPageContent("politika-za-biskvitkite")} />
    </PageShell>
  );
}
