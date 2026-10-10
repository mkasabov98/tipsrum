import Image from "next/image";

import { SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Image
        src="/logo-light.png"
        alt={SITE_NAME}
        width={1164}
        height={234}
        priority
        className="h-10 w-auto sm:h-12"
      />
      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Статистически анализ на конни надбягвания
      </h1>
      <p className="text-muted-foreground max-w-xl text-lg">
        Проектът е инициализиран. Маркетинг страниците идват в следваща фаза.
      </p>
    </main>
  );
}
