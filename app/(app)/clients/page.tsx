import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isOwnerSession } from "@/lib/access";
import { prisma } from "@/lib/prisma";

import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "./actions";

function formatRate(d: { toString: () => string }) {
  return d.toString().replace(/\.?0+$/, "");
}

export default async function ClientsPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!isOwnerSession(session)) {
    redirect("/quotes");
  }

  const { error } = await props.searchParams;
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-gradient">Clients</h1>
        <p className="mt-2 text-fg-subtle">
          Tarif horaire par défaut utilisé pour les devis (€/h HT).
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
        <h2 className="text-lg font-medium text-fg">Nouveau client</h2>
        <form
          action={createClientAction}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <label className="block text-sm text-fg-muted">
            <span className="mb-1 block">Nom</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
            />
          </label>
          <label className="block text-sm text-fg-muted">
            <span className="mb-1 block">Email (optionnel)</span>
            <input
              name="email"
              type="email"
              className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
            />
          </label>
          <label className="block text-sm text-fg-muted sm:col-span-2">
            <span className="mb-1 block">Tarif horaire (€ HT)</span>
            <input
              name="defaultRate"
              type="text"
              inputMode="decimal"
              required
              placeholder="ex. 85"
              className="w-full max-w-xs rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
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
      </section>

      <section>
        <h2 className="text-lg font-medium text-fg">Liste</h2>
        {clients.length === 0 ? (
          <p className="mt-3 text-fg-subtle">Aucun client.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {clients.map((c) => (
              <li key={c.id} className="glass rounded-2xl p-6">
                <form
                  action={updateClientAction}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={c.id} />
                  <label className="block text-sm text-fg-muted">
                    <span className="mb-1 block">Nom</span>
                    <input
                      name="name"
                      defaultValue={c.name}
                      required
                      className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
                    />
                  </label>
                  <label className="block text-sm text-fg-muted">
                    <span className="mb-1 block">Email</span>
                    <input
                      name="email"
                      type="email"
                      defaultValue={c.email ?? ""}
                      className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none focus:ring-2 focus:ring-accent-amber/40"
                    />
                  </label>
                  <label className="block text-sm text-fg-muted sm:col-span-2">
                    <span className="mb-1 block">Tarif horaire (€ HT)</span>
                    <input
                      name="defaultRate"
                      type="text"
                      inputMode="decimal"
                      required
                      defaultValue={formatRate(c.defaultRate)}
                      className="w-full max-w-xs rounded-xl border border-line-default bg-card-elevated px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-accent-amber/40"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-xl border border-line-strong bg-card-elevated px-4 py-2 text-sm text-fg hover:bg-card-strong"
                    >
                      Mettre à jour
                    </button>
                  </div>
                </form>
                <form
                  action={deleteClientAction.bind(null, c.id)}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className="text-sm text-accent-clay hover:underline"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
