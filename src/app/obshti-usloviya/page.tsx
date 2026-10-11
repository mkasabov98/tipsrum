import type { Metadata } from "next";

import { PageShell } from "@/components/site/page-shell";
import { Prose } from "@/components/site/prose";
import { getPageContent } from "@/lib/content";

const TITLE = "Общи условия";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
};

export default function Page() {
  return (
    <PageShell
      title={TITLE}
      eyebrow="Правила"
      crumbs={[
        { href: "/", label: "Начало" },
        { href: "/obshti-usloviya", label: TITLE },
      ]}
    >
      <Prose html={getPageContent("obshti-usloviya")} />
    </PageShell>
  );
}
