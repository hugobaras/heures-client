import { auth } from "@/auth";
import { isOwnerSession } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import {
  billableHoursFromEntries,
  rawHoursFromEntries,
  roundHours,
} from "@/lib/billing";
import { redirect } from "next/navigation";

async function getStats() {
  const entries = await prisma.timeEntry.findMany({
    select: {
      durationMinutes: true,
      appliedFactor: true,
      client: { select: { id: true, name: true } },
    },
  });
  const byClient = new Map<
    string,
    { id: string; name: string; raw: number; billable: number; count: number }
  >();
  for (const e of entries) {
    const id = e.client.id;
    const cur = byClient.get(id) ?? {
      id,
      name: e.client.name,
      raw: 0,
      billable: 0,
      count: 0,
    };
    cur.raw += e.durationMinutes / 60;
    cur.billable += (e.durationMinutes * e.appliedFactor.toNumber()) / 60;
    cur.count += 1;
    byClient.set(id, cur);
  }
  const totals = {
    raw: rawHoursFromEntries(entries),
    billable: billableHoursFromEntries(entries),
    count: entries.length,
  };
  return {
    byClient: [...byClient.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    ),
    totals,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!isOwnerSession(session)) {
    redirect("/quotes");
  }

  const { byClient, totals } = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gradient">Tableau de bord</h1>
        <p className="mt-2 max-w-xl text-fg-subtle">
          Vue d’ensemble des heures saisies et des heures facturables (après
          coefficient).
        </p>
      </div>

      <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-fg-faint">Saisies</p>
          <p className="mt-1 font-mono text-2xl text-fg">{totals.count}</p>
        </div>
        <div>
          <p className="text-sm text-fg-faint">Heures brutes</p>
          <p className="mt-1 font-mono text-2xl text-fg">
            {roundHours(totals.raw, 2)} h
          </p>
        </div>
        <div>
          <p className="text-sm text-fg-faint">Heures facturables</p>
          <p className="mt-1 font-mono text-2xl text-accent-teal">
            {roundHours(totals.billable, 2)} h
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-fg">Par client</h2>
        {byClient.length === 0 ? (
          <p className="mt-3 text-fg-subtle">
            Aucune saisie. Ajoutez un client puis des entrées.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {byClient.map((c) => (
              <li
                key={c.id}
                className="glass flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-4 py-3"
              >
                <span className="text-fg">{c.name}</span>
                <span className="font-mono text-sm text-fg-muted">
                  {roundHours(c.raw, 2)} h brutes —{" "}
                  <span className="text-accent-teal">
                    {roundHours(c.billable, 2)} h facturables
                  </span>{" "}
                  ({c.count} saisies)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
