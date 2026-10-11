/**
 * Seeds the `bets` table from scripts/data/bets-seed.csv.
 *
 * The CSV was extracted from the current WordPress site's results tables, so the
 * dashboards in Phase 4 are built against real history rather than invented data,
 * and Phase 10's Google Sheet sync has something to be verified against.
 *
 * Safe to re-run: ids are derived from the natural key, and the insert ignores
 * rows that already exist.
 *
 *   pnpm db:seed:bets
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { config } from "dotenv";

config({ path: ".env.local" });

type Row = {
  plan: "free" | "premium";
  date: string;
  time: string;
  course: string;
  race: string;
  horse: string;
  odds: string;
  result: "WON" | "PLACED" | "Lost" | "Void";
  stake: string;
  profit: string;
  month: string;
};

/** Minimal CSV reader: the file is generated, so quoting is predictable. */
function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let current = "";
    let quoted = false;
    for (const char of line) {
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) {
        cells.push(current);
        current = "";
      } else current += char;
    }
    cells.push(current);
    return Object.fromEntries(
      headers.map((h, i) => [h, cells[i] ?? ""]),
    ) as Row;
  });
}

/** Stable id from the natural key, so re-running produces the same rows. */
function idFor(row: Row): string {
  return createHash("sha1")
    .update([row.plan, row.date, row.course, row.race, row.horse].join("|"))
    .digest("hex")
    .slice(0, 24);
}

async function main() {
  const { db } = await import("../src/db/index");
  const { bets } = await import("../src/db/schema");
  const { sql } = await import("drizzle-orm");

  const csv = readFileSync(
    join(process.cwd(), "scripts/data/bets-seed.csv"),
    "utf8",
  );
  const rows = parseCsv(csv);
  console.info(`read ${rows.length} rows from CSV`);

  const values = rows.map((row) => ({
    id: idFor(row),
    plan: row.plan,
    date: row.date,
    time: row.time || null,
    course: row.course,
    race: row.race,
    horse: row.horse,
    odds: row.odds,
    result: row.result,
    stake: row.stake,
    profit: row.profit,
    month: row.month,
  }));

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < values.length; i += CHUNK) {
    const chunk = values.slice(i, i + CHUNK);
    const result = await db
      .insert(bets)
      .values(chunk)
      .onConflictDoNothing()
      .returning({ id: bets.id });
    inserted += result.length;
  }

  const [summary] = await db.execute<{
    total: number;
    free: number;
    premium: number;
  }>(sql`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE plan = 'free')::int AS free,
           count(*) FILTER (WHERE plan = 'premium')::int AS premium
    FROM bets
  `);

  console.info(
    `inserted ${inserted} new rows; table now holds ${summary.total} (free ${summary.free}, premium ${summary.premium})`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
