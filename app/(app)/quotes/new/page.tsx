import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isOwnerSession } from "@/lib/access";

import { prisma } from "@/lib/prisma";

import { createQuoteAction } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewQuotePage(props: Props) {
  const session = await auth();
  if (!isOwnerSession(session)) {
    redirect("/quotes");
  }

  const { error } = await props.searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/quotes" className="text-sm text-fg-muted hover:text-fg">
          ← Retour aux devis
        </Link>
        <h1 className="mt-4 font-display text-3xl text-gradient">
          Nouveau devis
        </h1>
        <p className="mt-2 text-fg-subtle">
          Les lignes sont groupées par catégorie ; les montants utilisent le
          tarif horaire du client.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-accent-clay/40 bg-card-elevated px-4 py-3 text-sm text-accent-clay">
          {error}
        </p>
      ) : null}

      {clients.length === 0 ? (
        <p className="text-fg-subtle">
          Ajoutez d’abord un{" "}
          <Link href="/clients" className="text-accent-teal underline">
            client
          </Link>
          .
        </p>
      ) : (
        <form
          action={createQuoteAction}
          className="glass max-w-xl space-y-4 rounded-2xl p-6"
        >
          <label className="block text-sm text-fg-muted">
            <span className="mb-1 block">Client</span>
            <select
              name="clientId"
              required
              className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-fg-muted">
            <span className="mb-1 block">Titre (optionnel)</span>
            <input
              name="title"
              placeholder="ex. Lot 1 — intégration API"
              className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">Période du</span>
              <input
                type="date"
                name="periodStart"
                required
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-accent-amber/40"
              />
            </label>
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">au</span>
              <input
                type="date"
                name="periodEnd"
                required
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-accent-amber/40"
              />
            </label>
          </div>
          <label className="block text-sm text-fg-muted">
            <span className="mb-1 block">
              Taux TVA (optionnel, ex. 0.2 pour 20 %)
            </span>
            <input
              name="vatRate"
              type="text"
              inputMode="decimal"
              placeholder="vide = pas de ligne TVA"
              className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-accent-amber/40"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-button-solid-bg px-4 py-2.5 text-sm font-medium text-button-solid-fg hover:bg-button-solid-bg-hover"
          >
            Créer le devis
          </button>
        </form>
      )}
    </div>
  );
}
