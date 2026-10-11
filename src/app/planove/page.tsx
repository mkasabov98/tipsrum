import {
  GemIcon,
  GlobeIcon,
  HandshakeIcon,
  HeadphonesIcon,
  ScaleIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PlanCards } from "@/components/home/plan-cards";
import { ComparisonTable } from "@/components/plans/comparison-table";
import { CtaBand } from "@/components/site/cta-band";
import { Faq, type FaqItem } from "@/components/site/faq";
import { DarkSection, Eyebrow, PageHero } from "@/components/site/page-shell";

const TITLE = "Планове";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
  description:
    "Безплатен план с до 3 прогнози на ден и Премиум с до 6 прогнози, ексклузивна група и 30-дневна гаранция.",
};

/** The six trust points from the live plans page, with icons for the emoji. */
const TRUST = [
  {
    icon: TrendingUpIcon,
    title: "Верифицирана статистика",
    body: "Нашите прогнози са базирани на дългосрочни данни и внимателен анализ. Можете да се доверите на верифицираните ни резултати, които показват постоянство и успешност във времето.",
  },
  {
    icon: GemIcon,
    title: "Доказани стойностни залози",
    body: "Нашите съвети се базират на стойностни залози – предложения, които статистически носят предимство и максимизират вашите шансове за успех.",
  },
  {
    icon: HandshakeIcon,
    title: "Залагаме заедно с вас",
    body: "Всяка прогноза, която изпращаме на нашите абонати, е залог, който ние също поставяме. Така гарантираме, че вашият успех е и наш успех.",
  },
  {
    icon: HeadphonesIcon,
    title: "Винаги сме насреща",
    body: "Нашият екип е винаги на разположение да отговори на въпросите ви и да ви предостави подкрепа, когато имате нужда от нея.",
  },
  {
    icon: ScaleIcon,
    title: "Прозрачност и честност",
    body: "Държим на пълната прозрачност във всяка прогноза и резултат. Всичко е достъпно за проверка – без скрити условия или подвеждаща информация. Вие знаете точно какво получавате.",
  },
  {
    icon: GlobeIcon,
    title: "Общност на успешни играчи",
    body: "Присъединете се към нашата общност от опитни и амбициозни играчи. Споделяйте знания, обсъждайте стратегии и растете заедно с хора, които споделят вашата страст към спортните залози.",
  },
];

/**
 * Ported from the FAQ on the live site, with the links repointed at the new
 * routes: /pro became /premium, and the truncated percent-encoded Cyrillic slug
 * became /polezni-stapki.
 */
const FAQ: readonly FaqItem[] = [
  {
    question: "Предлагате ли безплатен пробен период?",
    answer: (
      <p>
        Ние предоставяме опцията за абониране към нашия{" "}
        <Link href="/free">безплатен план</Link>, който ви дава достъп до
        ежедневни безплатни прогнози, изготвени от нашите експерти.
      </p>
    ),
  },
  {
    question: "Имате ли гаранция на парите?",
    answer: (
      <p>
        При абониране към нашия <Link href="/premium">премиум план</Link> вие ще
        получите 30-дневна гаранция на парите си. Това означава, че можете да се
        възползвате от всички предимства на услугата ни без риск.
      </p>
    ),
  },
  {
    question: "Къде мога да видя статистика от предишни месеци?",
    answer: (
      <p>
        В страницата на <Link href="/free">безплатния план</Link>, както и на{" "}
        <Link href="/premium">премиум плана</Link>, ще намерите статистика за
        направените залози. Пълният регистър е в{" "}
        <Link href="/rezultati">резултатите</Link> — успеваемост, обща
        възвръщаемост и резултат от всяка отделна прогноза.
      </p>
    ),
  },
  {
    question: "Къде мога да следя прогнозите?",
    answer: (
      <p>
        След като се присъедините към един от плановете ще бъдете включени в
        Telegram група, където всеки ден ще получавате прогнозите, както и
        инструкции как да процедирате.
      </p>
    ),
  },
  {
    question: "Какви стъпки трябва да следвам за най-добри резултати?",
    answer: (
      <p>
        За постигане на максимално добри резултати е хубаво да следвате
        специално изработена стратегия, с която може да се запознаете в тази{" "}
        <Link href="/suveti-pri-zapochvane">статия</Link>.
      </p>
    ),
  },
  {
    question: "Как да си определя банка?",
    answer: (
      <p>
        Определянето на банка изцяло зависи от рисковия подход, който вие искате
        да имате. Запознайте се с тази{" "}
        <Link href="/opredelqne-na-banka">информация</Link>, за да придобиете
        представа кое би било най-добре за вас.
      </p>
    ),
  },
  {
    question: "Какво да направя, за да избегна лимитиране на акаунта ми?",
    answer: (
      <p>
        Лимитирането на акаунта е един от най-големите проблеми, които
        професионалният залагащ може да срещне. Запознайте се със{" "}
        <Link href="/kak-da-izbegnete-limitirane">стъпките</Link>, които ще ви
        помогнат да го предотвратите.
      </p>
    ),
  },
  {
    question: "Лимитираха ме, какво да направя?",
    answer: (
      <p>
        Това, че са ви лимитирали, не трябва да бъде проблем. Следвайки тези
        полезни <Link href="/polezni-stapki">стъпки</Link>, ще успеете да се
        преборите с него.
      </p>
    ),
  },
  {
    question: "Къде мога да се свържа с вас?",
    answer: (
      <p>
        Пишете ни във формата за <Link href="/kontakti">контакти</Link> и ние ще
        се свържем с вас до няколко часа.
      </p>
    ),
  },
];

export default function PlansPage() {
  return (
    <main className="flex-1">
      <PageHero
        width="wide"
        eyebrow={TITLE}
        title="Един безплатен старт. Едно ниво нагоре."
        lead="Изпробвай услугата без риск в безплатната група. Когато си готов за повече обем и по-високи коефициенти — премини към Премиум."
        crumbs={[
          { href: "/", label: "Начало" },
          { href: "/planove", label: TITLE },
        ]}
      />

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:py-16">
        <PlanCards />
        <p className="text-muted-foreground mt-6 text-center text-xs">
          Цените са в евро. Безплатният план не изисква банкови данни.
        </p>
      </section>

      <DarkSection>
        <Eyebrow>Разлика в плановете</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Какво получаваш при всеки план
        </h2>
        <div className="mt-8">
          <ComparisonTable />
        </div>
      </DarkSection>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <Eyebrow>Защо да ни се доверите</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Шест причини, които стоят зад всяка прогноза
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="border-border bg-card rounded-xl border p-6"
            >
              <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg">
                <Icon className="size-4" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:pb-20">
        <Eyebrow>Въпроси</Eyebrow>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Често задавани въпроси
        </h2>
        <div className="mt-8">
          <Faq items={FAQ} />
        </div>
      </section>

      <CtaBand
        title="Започни от безплатната група"
        lead="Без карта, без ангажимент. Виж прогнозите на живо и надгради, когато решиш."
        primary={{ href: "/register", label: "Влез безплатно" }}
        secondary={{ href: "/premium", label: "Разгледай Премиум" }}
      />
    </main>
  );
}
