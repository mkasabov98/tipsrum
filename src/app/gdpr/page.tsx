import type { Metadata } from "next";

import { PageShell } from "@/components/site/page-shell";
import { Prose } from "@/components/site/prose";
import { getPageContent } from "@/lib/content";

const TITLE = "Политика за поверителност";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
};

export default function Page() {
  return (
    <PageShell
      title={TITLE}
      eyebrow="Поверителност"
      crumbs={[
        { href: "/", label: "Начало" },
        { href: "/gdpr", label: TITLE },
      ]}
    >
      <Prose html={getPageContent("gdpr")} />
    </PageShell>
  );
}
