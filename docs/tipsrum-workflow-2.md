# Tipsrum.com — Website Workflow & Rebuild Specification

Prepared for a full rebuild in code (replacing the current WordPress stack).
Based on a live scan of the site plus the owner's description of the intended behaviour.

---

## 1. What the site is

Tipsrum is a subscription service that sells horse-racing tips to a Bulgarian
audience. The whole site is in Bulgarian. It frames itself as data/statistics
analysis rather than gambling advice, and carries an 18+ / responsible-gambling
notice in the footer.

There are two products:

- **Free plan (Безплатен)** — €0. Registration required. Gives access to a
  Telegram **group**.
- **Premium plan (Премиум)** — €25 / month (shown as 48.90 лв). Registration +
  payment required. Gives access to a Telegram **bot** (which then hands out the
  premium channel invite). Advertised with a 30-day money-back guarantee.

The core loop is the same for both: the website is a marketing + registration +
billing front end, and the actual tips are delivered on Telegram. The website's
job is to sign a user up, verify what they're entitled to, and hand them the
correct Telegram entry point.

---

## 2. Current tech stack (what you are replacing)

- **CMS / hosting:** WordPress on SiteGround.
- **Page builder:** Elementor. Every page is an Elementor layout, so the current
  markup is heavy and builder-generated — treat it as a design reference, not
  something to port directly.
- **Membership / auth / billing:** ARMember plugin. This handles user accounts,
  login/registration, plan definitions, the paywall, and the Stripe/PayPal
  checkout.
- **Payments:** Stripe and PayPal, wired through ARMember.
- **Results tables:** WPDataTables. The monthly summaries and the big per-bet
  results tables are WPDataTables instances, with color-coding (WON / PLACED /
  Lost / Void) applied via JavaScript.
- **Fonts/brand:** Montserrat Bold, black background (#000000), olive green
  accent (#536942), a "Bloomberg terminal" data-heavy aesthetic.

---

## 3. Site map

Public / marketing:

- `/` — Home (Начало)
- `/planove/` — Plans overview (both plans side by side, FAQ)
- `/free/` — Free plan landing page (stats, charts, full results table, CTA to register)
- `/bezplaten/` — Free plan detail (linked as "Повече информация" / "Вижте повече")
- `/premium/` — Premium plan landing page (stats, plan comparison, results table, CTA to checkout)
- `/za-nas/` — About us
- `/kontakti/` — Contact (contact form)
- `/polezno/` — Blog / useful articles index
  - `/suveti-pri-zapochvane/` — "Tips when starting"
  - `/opredelqne-na-banka/` — "Setting your bankroll"
  - `/kak-da-izbegnete-limitirane/` — "How to avoid account limiting"
  - (plus other articles)

Legal:

- `/obshti-usloviya/` — Terms
- `/gdpr/` — Privacy / GDPR
- `/politika-za-biskvitkite/` — Cookie policy

Account / auth / billing (ARMember):

- `/register/` — Registration form
- `/login/` — Login form
- `/my_account/` — Account area (redirects to `/login/` if not authenticated)
- `/forgot_password/` — Password reset
- `/premium_checkout/` — Premium paid checkout (Stripe / PayPal)

---

## 4. User roles

Three effective states:

1. **Guest** — not logged in. Can see all marketing pages and the results
   statistics. Cannot access the account area.
2. **Free member** — registered, no payment. Entitled to the Telegram group link.
3. **Premium member** — registered + active paid subscription. Entitled to the
   Telegram bot (→ premium channel).

The account area is gated. Visiting `/my_account/` while logged out redirects to
`/login/?arm_redirect=https://tipsrum.com/my_account/` — i.e. it sends you to
login and remembers where you were trying to go. Your rebuild needs the same
"protected route → redirect to login → return after auth" behaviour.

Entitlement (free vs premium) is the key piece of state. Everything downstream —
which Telegram link a user sees, which CTA button shows, whether they can reach
premium content — is driven by that flag. In the current site ARMember stores it
as the user's plan/membership level.

---

## 5. Authentication

Standard email/password accounts.

**Registration form** (`/register/`) collects:
- Username (Потребителско име)
- Email
- Password
- Confirm password
- Checkbox: agree to Terms + Privacy (required)
- Checkbox: consent to receive free tips / offers / news by email (marketing opt-in)

Note: the registration form itself has **no plan selector**. Plan choice is
driven by *which button the user arrived from*, not a dropdown on the form:
- Free plan CTAs point users into the normal registration flow.
- The premium CTA points users to `/premium_checkout/`, where registration and
  payment happen together.

**Login form** (`/login/`): email + password, "remember me", and a
"forgot password?" link.

**Password reset:** `/forgot_password/`.

For the rebuild, this is a conventional auth system (email/password, session or
JWT, password reset by email). The only non-obvious requirement is the
`arm_redirect`-style "return to intended page after login".

---

## 6. Free subscription workflow

Step by step, from the user's point of view:

1. User lands on `/free/` (or `/bezplaten/`). The page sells the free plan:
   headline stats (average monthly ROI, number of winning months, free tips per
   day — shown as animated counters), a monthly profit chart, and the full
   historical results table. CTA: **"Регистрирай се"** ("Register") — copy notes
   it "takes less than 30 seconds" and needs no card.
2. User registers via the standard registration form (section 5). No payment.
3. On successful registration the account is created as a **free member**.
4. The user lands on the **free thank-you page** (`free_thank_you`): header
   *"🎉 Ти си вътре!"* ("You're in!") / *"Твоят безплатен акаунт е активиран
   успешно."* ("Your free account has been activated successfully."). It shows a
   single primary button, **"Влез в Telegram групата"** ("Enter the Telegram
   group"), plus an upsell line: *"Готов ли си да печелиш повече? Вземи Премиум
   сега"* ("Ready to win more? Get Premium now") linking to the premium plan.
5. From then on, when a logged-in free user views account/plan pages, the site
   shows them the "you're a free member" state and the group link, rather than
   the "register" CTA.

**Key contrast with premium:** the free flow has **no bot and no email
verification**. The Telegram group link is placed directly on the thank-you page
as a button — the user just clicks it. There's no `@TipsrumPremiumBot`-style
gatekeeping, no Sheet lookup, no invite-link generation. This makes sense: the
free group isn't gated the way the premium channel is. So free delivery is simply
"authenticated free member → show the group-link button + a premium upsell."

Rebuild note: the free flow is just *register → mark as free → show thank-you page
with group link + premium upsell*. No billing, no bot, no verification.

---

## 7. Premium subscription workflow

1. User lands on `/premium/`. The page sells premium: headline stats, a
   "bank growth" chart, a **free-vs-premium comparison** block, and the premium
   results table. Primary CTA: **"Към Премиум групата - 25€/месец"**
   ("To the Premium group – €25/month"), which links to `/premium_checkout/`.
2. At `/premium_checkout/` the user registers (if not already) and pays. Payment
   is **Stripe or PayPal**, handled by ARMember today. Price: €25 / month
   recurring (48.90 лв).
3. On a **successful payment**, the account becomes a **premium member**.
4. The user is given the **Telegram bot** (`@TipsrumPremiumBot`) as the entry
   point, and follows a short manual verification to get into the premium group
   (see section 8 for the exact steps).
5. Ongoing: it's a recurring monthly subscription. The rebuild must handle
   renewals, failed payments, cancellations, and a 30-day money-back guarantee
   window. When a subscription lapses/cancels, the account should drop back out
   of premium entitlement (and ideally the user should be removed from the
   premium Telegram channel — see section 8).

### 7a. The checkout page is state-dependent (important)

`/premium_checkout/` is not a single static page — it renders different content
depending on the user's membership status at load time. This is done today with
ARMember conditional shortcodes; in the rebuild it should be explicit
server/client logic on entitlement + payment status. There are (at least) three
distinct states:

- **State A — already an active premium member.** Header: *"Вече сте част от
  Премиум клуба!"* ("You're already part of the Premium club!") with
  *"Няма нужда да плащате отново. Вашият абонамент е активен."* ("No need to pay
  again. Your subscription is active."). Shows a single button to Telegram
  (*"Към Telegram групата"*). Purpose: **stop an existing member from paying
  twice.** The rebuild must detect active entitlement on this route and short-
  circuit the payment form.

- **State B — payment just succeeded.** Header: *"Успешно плащане!"* ("Successful
  payment!") / *"Добре дошъл в премиум клуба."* This is the onboarding screen with
  the three-step bot instructions and the *"Отвори Telegram бот"* button (detailed
  in section 8). This is the post-payment success/thank-you state.

- **State C — payment processing / no access.** Header: *"Обработваме плащането…
  (или нямате достъп до тази страница)"* ("Processing the payment… (or you don't
  have access to this page)"). This is a **pending/locked fallback** that covers
  two cases at once:
  - *PayPal just paid:* the page tells the user to wait ~10 seconds for the
    transaction to process and then press **"Обнови страницата"** ("Refresh page").
  - *Not a premium member:* the page is locked and shows a **"Към Премиум план"**
    ("To Premium plan") button prompting them to upgrade.

State C is the tell-tale sign of the current architecture's main weakness: because
entitlement isn't updated instantly (especially for async PayPal payments), the
site falls back to a **manual "refresh" loop** and a polling/hope mechanism. Your
rebuild should eliminate this by driving entitlement from **payment webhooks**
(see rebuild note below), so the success screen appears automatically without the
user having to refresh.

Rebuild note: the critical difference from the free flow is that premium
entitlement must be driven by **payment/subscription status**, not just account
existence. Treat the payment provider's subscription state (active / past_due /
canceled) as the source of truth and mirror it onto the user's entitlement flag,
via **webhooks** from Stripe/PayPal rather than trusting the browser redirect or a
manual page refresh. Getting this right is what removes the State C "processing…"
workaround entirely. Also replicate State A's guard so an active member can never
be charged a second time.

---

## 8. Telegram delivery (the part that isn't visible on the page)

This is the mechanism that connects "paid/registered on the website" to "actually
receiving tips". Based on how the current setup works:

- **Free members** → handed a Telegram **group** invite link. Straightforward:
  once they're a free member, show/send them the group link.
- **Premium members** → handed a Telegram **bot** (`@TipsrumPremiumBot`). The bot
  is what gates the premium channel.

**Exact premium onboarding (from the success screen).** After a successful
payment (State B in section 7a), the user is shown three explicit steps and an
**"Отвори Telegram бот"** ("Open Telegram bot") button:

1. Press the button to open the special Telegram bot.
2. Press **START** at the bottom of the chat.
3. The bot asks for the user's email. The user must type **exactly the email they
   registered with** — the success page even displays their registered email on
   screen for them to copy.

The bot then matches that email against the paid-membership records and, if it
finds an active premium member, issues the premium group/channel invite. There's
a fallback line in case the button fails: *"Линкът не работи? Потърси
@TipsrumPremiumBot в Telegram."* ("Link not working? Search @TipsrumPremiumBot in
Telegram.").

**The email address is the shared key** between the website's membership database
and the Telegram bot. That's the single most important integration detail in the
whole system: verification is "does this typed email correspond to an active
premium member?" Everything else (the Sheet, the automation) is just plumbing to
answer that one question.

In the current stack the plumbing is split across **two** automation tools:

**Write side — Uncanny Automator (WordPress).** When a user registers for the
premium plan, Uncanny Automator instantly writes their registered email into a
Google Sheet. This is what "publishes" the entitlement so the bot can find it.

**Read/deliver side — Make.com scenario (the Telegram bot).** A Make.com scenario
drives the bot. Its actual logic, step by step:

1. **Telegram Bot — Watch Updates** (trigger): listens for every message sent to
   the bot.
2. **Router** splits on what the user sent:
   - *`/start`* → bot sends the greeting / "reply with your email" message.
   - *Message looks like an email* → **Google Sheets: Search Rows** — looks the
     email up in the sheet.
   - *Anything else* → bot sends a fallback reply.
3. After the sheet search, a **second Router** splits on whether the email was
   found:
   - **Found (active premium):** **Google Sheets: Update a Row** (marks the row —
     e.g. verified / used) → **Telegram Bot: Create a Chat Invite Link** →
     **Telegram Bot: Send a Text Message** delivering that invite link.
   - **Not found:** **Telegram Bot: Send a Text Message** telling them they're not
     a recognised premium member.

So the full current chain is: *premium registration → Uncanny Automator writes
email to Sheet → user opens bot, types email → Make.com searches the Sheet →
if matched, Make.com generates a fresh Telegram invite link and sends it; if not,
it's rejected.* Note the current setup already **creates a per-request chat invite
link** rather than handing out one shared link — good; keep that behaviour.

One thing worth verifying in the current setup: whether Uncanny Automator writes
the email on **registration** or only after **payment actually clears**. If it
fires at registration before the payment is confirmed, someone could get added to
the Sheet (and thus pass the bot check) without a completed payment. This is
exactly the gap that payment webhooks close in the rebuild.

For the rebuild you can collapse both tools into your own backend:

- When a user's payment is confirmed (Stripe/PayPal webhook — see section 7a),
  write their entitlement to your database. This replaces Uncanny Automator.
- Have the Telegram bot query your backend directly (an API call) to verify a
  user and generate the invite. This replaces the Make.com scenario and the Sheet.
- **Improve on the manual email-typing step.** Making the user retype their email
  into the bot is error-prone (typos, wrong email, shared accounts). Better: issue
  a **one-time deep link** with a signed token straight from the success page
  (`t.me/TipsrumPremiumBot?start=<token>`), so pressing the button both opens the
  bot and identifies the user automatically — no manual email entry. Keep the
  "type your email" path only as a manual fallback. This also lets you bind the
  user's Telegram ID to their account, which you'll need for revocation.
- Keep the current per-request **single-use / expiring invite link** behaviour so
  links can't be shared.
- Handle the reverse case, which the current setup does not: on cancellation /
  expiry / refund, revoke access (kick from the premium channel via the Bot API)
  using the stored Telegram ID.

The important design point: **the Telegram bot needs a reliable way to ask "is
this person a paying member right now?"** Today that's a Sheet; in the rebuild it
should be your own membership database/API.

---

## 9. Results / statistics system

This is a big, content-heavy part of the site and worth getting right, because
the transparent track record is the main sales tool.

Two plans each have their own results data set (Free and Premium are separate
records with different picks). For each plan the site shows:

- **Animated headline counters** — average monthly ROI, winning months, tips/day.
- **A monthly summary table** — one row per month with: month, ROI %, monthly
  profit, cumulative profit.
- **A monthly profit chart** — visualises the cumulative bankroll growth. Copy
  explicitly leans into honesty ("we have losing months too, we show them
  openly").
- **A full per-bet results table** — hundreds/thousands of rows. Columns include:
  date + time, racecourse/race, horse, odds (Коефициент), result
  (WON / PLACED / Lost / Void), single-bet profit, running/cumulative profit,
  drawdown, and the month label. Results are color-coded by outcome.

**Where the data comes from.** The results are maintained in a **Google Sheet
that is populated automatically** (by the owner's own pick-grading pipeline), and
WPDataTables reads from that sheet to render the on-page tables. So the current
data path is: *automated results pipeline → Google Sheet → WPDataTables → page*.
The website itself is a read-only consumer of the data — it doesn't produce or
grade results, it just displays what's in the sheet.

Data characteristics to plan for:
- Rows accumulate daily and the tables get very large. The current WPDataTables
  approach dumps the entire table into the page. In the rebuild, paginate /
  virtualise / lazy-load, and compute the monthly summaries and headline stats
  **server-side** from the raw per-bet rows rather than storing them separately
  (single source of truth = the per-bet log).
- Money is formatted European-style (comma decimals, dot thousands) and prices
  are shown in both EUR and BGN.

**Rebuild note on the data feed.** Keep the same principle — the results come from
an external automated source, and the site just displays them. Two clean options
for the rebuild:
- Keep the Google Sheet as the source and have the new backend **sync/import** it
  on a schedule (or on change) into the `bets` table, then serve everything from
  the database. Lowest-friction: the owner's existing pipeline keeps writing to
  the sheet unchanged.
- Or have the pipeline write directly to the new backend via an API / DB insert,
  dropping the sheet entirely. Cleaner long-term but requires changing the
  pipeline.
Either way, the website reads from the `bets` table, not live from the sheet, so
page loads don't depend on Google.

Suggested data model:
- `bets` (id, plan [free/premium], date, time, course, race, horse, odds,
  result, stake, profit, month)
- Monthly summary + ROI + cumulative + drawdown are **derived** from `bets`.

---

## 10. Other pages & content

- **Home** — hero, the three value props (free access / money-back guarantee /
  24-7 support), an "about us" block, both plan cards with their results tables,
  a testimonials gallery (screenshots of member wins), and a preview of the blog.
- **Plans** (`/planove/`) — the two plans side by side with a "why trust us"
  section and a fairly long FAQ (free trial, money-back guarantee, where to see
  past stats, how to follow the tips, staking strategy, bankroll, avoiding
  account limits, contact). The FAQ is worth porting more or less verbatim.
- **Blog** (`/polezno/`) — educational articles (starting tips, bankroll,
  avoiding limits, etc.). Standard CMS content — needs an editable article system.
- **Contact** (`/kontakti/`) — contact form. Email `info@tipsrum.com`, phone,
  and social links (Telegram support `t.me/tipsrum_support`, Instagram, TikTok).
- **Legal** — Terms, GDPR/Privacy, Cookie policy. Keep these; they're required
  and referenced from the registration consent.

---

## 11. Third-party integrations to reproduce

- **Payments:** Stripe + PayPal, recurring monthly, with webhooks driving
  entitlement. (Currently via ARMember.)
- **Email:** transactional email (registration, password reset, payment
  receipts) + marketing email to the opt-in list. Currently marketing runs
  through Brevo (sender "Екипът на Tipsrum", info@tipsrum.com) with DKIM/DMARC
  configured. Keep the marketing opt-in checkbox feeding whatever list tool you
  choose.
- **Telegram Bot API:** for premium verification, invite delivery, and access
  revocation (see section 8).
- **Analytics / pixels:** the site has run Meta Ads campaigns, so there's likely
  a Meta pixel and possibly Google Analytics on the current pages — carry over
  whatever tracking is in use so ad attribution isn't lost.

---

## 12. Summary of the core workflow (the one paragraph that matters)

A visitor browses the marketing pages and the public track record. They choose a
plan. **Free:** they register (email/username/password + consents), the account
is flagged free, and they receive the Telegram **group** link. **Premium:** they
go through checkout, register + pay €25/month via Stripe or PayPal, the account is
flagged premium on successful payment, and they receive the Telegram **bot**,
which verifies them and issues the premium channel invite. Entitlement (free vs
premium) is the central piece of state: it gates the account area, decides which
Telegram entry point the user gets, and — for premium — is kept in sync with the
payment provider's subscription status via webhooks, including downgrading and
revoking Telegram access when a subscription ends.

---

## 13. Rebuild checklist

- [ ] Email/password auth + password reset + "return to intended page after login"
- [ ] Protected account area
- [ ] Free registration → free entitlement → deliver Telegram group link
- [ ] Premium checkout (Stripe + PayPal, recurring) → premium entitlement
- [ ] Payment webhooks as the source of truth for premium status
- [ ] Cancellation / expiry / failed-payment handling + 30-day guarantee window
- [ ] Telegram bot ↔ backend verification API (replaces Uncanny Automator + Make.com + Sheets)
- [ ] Single-use/expiring premium invites + auto-revoke on lapse
- [ ] Results system: `bets` table → derived monthly stats, charts, paginated tables
- [ ] EUR/BGN formatting, Bulgarian localisation throughout
- [ ] Blog/CMS for articles; static legal pages; contact form
- [ ] Marketing email opt-in wired to list tool; transactional email
- [ ] Carry over Meta pixel / analytics
