import Link from "next/link";

import {
  billableHoursFromEntries,
  rawHoursFromEntries,
  roundHours,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { createTimeEntryAction, deleteTimeEntryAction } from "./actions";

type Search = {
  client?: string;
  from?: string;
  to?: string;
};

function parseYmd(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function EntriesPage(props: {
  searchParams: Promise<Search & { error?: string }>;
}) {
  const sp = await props.searchParams;
  const { error, ...filterSp } = sp;
  const clientFilter = filterSp.client?.trim() || "";
  const from = parseYmd(filterSp.from);
  const to = parseYmd(filterSp.to);

  const [clients, categories, entries] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.timeCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.timeEntry.findMany({
      where: {
        ...(clientFilter ? { clientId: clientFilter } : {}),
        ...(from && to ? { date: { gte: from, lte: to } } : {}),
        ...(from && !to ? { date: { gte: from } } : {}),
        ...(!from && to ? { date: { lte: to } } : {}),
      },
      include: { client: true, category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const raw = rawHoursFromEntries(entries);
  const billable = billableHoursFromEntries(entries);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-gradient">Saisies</h1>
        <p className="mt-2 text-fg-subtle">
          Durée saisie en heures ; le coefficient de la catégorie s’applique au
          moment de l’enregistrement.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-xl border border-accent-clay/40 bg-card-elevated px-4 py-3 text-sm text-accent-clay"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-medium text-fg">Nouvelle saisie</h2>
        {clients.length === 0 || categories.length === 0 ? (
          <p className="mt-3 text-fg-subtle">
            Créez au moins un client et exécutez le seed des catégories (
            <code className="font-mono text-xs">npm run db:seed</code>
            ).
          </p>
        ) : (
          <form
            action={createTimeEntryAction}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <label className="block text-sm text-fg-muted sm:col-span-2">
              <span className="mb-1 block">Client</span>
              <select
                name="clientId"
                required
                className="w-full max-w-md rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-fg-muted sm:col-span-2">
              <span className="mb-1 block">Catégorie</span>
              <select
                name="categoryId"
                required
                className="w-full max-w-md rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} (×{cat.factor.toString()})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">Date</span>
              <input
                type="date"
                name="date"
                required
                defaultValue={today}
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
              />
            </label>
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">Durée (heures)</span>
              <input
                name="durationHours"
                type="text"
                inputMode="decimal"
                required
                placeholder="ex. 2,5"
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
              />
            </label>
            <label className="block text-sm text-fg-muted sm:col-span-2">
              <span className="mb-1 block">Note (optionnel)</span>
              <input
                name="note"
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-button-solid-bg px-4 py-2.5 text-sm font-medium text-button-solid-fg hover:bg-button-solid-bg-hover"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-medium text-fg">Filtres</h2>
        <form method="get" className="mt-4 flex flex-wrap gap-4">
          <label className="text-sm text-fg-muted">
            <span className="mb-1 block">Client</span>
            <select
              name="client"
              defaultValue={clientFilter}
              className="rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg"
            >
              <option value="">Tous</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-fg-muted">
            <span className="mb-1 block">Du</span>
            <input
              type="date"
              name="from"
              defaultValue={filterSp.from ?? ""}
              className="rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono"
            />
          </label>
          <label className="text-sm text-fg-muted">
            <span className="mb-1 block">Au</span>
            <input
              type="date"
              name="to"
              defaultValue={filterSp.to ?? ""}
              className="rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-xl border border-line-strong bg-card-elevated px-4 py-2 text-sm text-fg hover:bg-card-strong"
            >
              Appliquer
            </button>
            <Link
              href="/entries"
              className="rounded-xl px-4 py-2 text-sm text-fg-muted hover:text-fg"
            >
              Réinitialiser
            </Link>
          </div>
        </form>
        <p className="mt-4 font-mono text-sm text-fg-muted">
          Période filtrée : {roundHours(raw, 2)} h brutes —{" "}
          <span className="text-accent-teal">
            {roundHours(billable, 2)} h facturables
          </span>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-fg">Historique</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-fg-subtle">Aucune entrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line-default">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line-default bg-card-elevated text-fg-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium text-right">Durée</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Facturable
                  </th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const rawH = e.durationMinutes / 60;
                  const billH =
                    (e.durationMinutes * e.appliedFactor.toNumber()) / 60;
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-line-default/80 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-fg-muted">
                        {e.date.toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-fg">{e.client.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border border-line-default px-2 py-0.5 text-xs text-fg-muted",
                          )}
                        >
                          {e.category.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {roundHours(rawH, 2)} h
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-accent-teal">
                        {roundHours(billH, 2)} h
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-fg-subtle">
                        {e.note ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteTimeEntryAction.bind(null, e.id)}>
                          <button
                            type="submit"
                            className="text-xs text-accent-clay hover:underline"
                          >
                            Supprimer
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
