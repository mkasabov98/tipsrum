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
    <PageShell title={TITLE}>
      <Prose html={getPageContent("obshti-usloviya")} />
    </PageShell>
  );
}
