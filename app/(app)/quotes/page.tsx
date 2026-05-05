import Link from "next/link";

import { auth } from "@/auth";
import { isOwnerSession, normalizeEmail } from "@/lib/access";
import { roundMoney } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export default async function QuotesListPage() {
  const session = await auth();
  const owner = isOwnerSession(session);
  const userEmail = normalizeEmail(session?.user?.email);

  const quotes = owner
    ? await prisma.quote.findMany({
        orderBy: { createdAt: "desc" },
        include: { client: true, lines: true },
      })
    : userEmail
      ? await prisma.quote.findMany({
          where: { client: { email: userEmail } },
          orderBy: { createdAt: "desc" },
          include: { client: true, lines: true },
        })
      : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gradient">
            {owner ? "Devis" : "Mes devis"}
          </h1>
          <p className="mt-2 text-fg-subtle">
            {owner
              ? "Générés à partir des saisies sur une période. PDF téléchargeable."
              : "Devis pour lesquels votre e-mail correspond à celui du client indiqué — vous pouvez consulter et télécharger le PDF."}
          </p>
        </div>
        {owner ? (
          <Link
            href="/quotes/new"
            className="rounded-xl bg-button-solid-bg px-4 py-2.5 text-sm font-medium text-button-solid-fg hover:bg-button-solid-bg-hover"
          >
            Nouveau devis
          </Link>
        ) : null}
      </div>

      {!owner && !userEmail ? (
        <p className="text-fg-subtle">
          Votre compte n’a pas d’e-mail : impossible d’associer des devis.
          Contactez l’émetteur du devis.
        </p>
      ) : quotes.length === 0 ? (
        <p className="text-fg-subtle">
          {owner
            ? "Aucun devis pour l’instant."
            : "Aucun devis ne correspond à votre e-mail. Il doit être identique à celui renseigné sur la fiche client lors de l’émission du devis."}
        </p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const subtotal = q.lines.reduce(
              (s, l) => s + l.lineTotal.toNumber(),
              0,
            );
            return (
              <li key={q.id}>
                <Link
                  href={`/quotes/${q.id}`}
                  className="glass flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-4 py-4 transition-colors hover:bg-card-strong"
                >
                  <span className="text-fg">
                    {q.client.name}
                    <span className="ml-2 font-mono text-sm text-fg-muted">
                      {q.periodStart.toLocaleDateString("fr-FR")} —{" "}
                      {q.periodEnd.toLocaleDateString("fr-FR")}
                    </span>
                  </span>
                  <span className="font-mono text-sm text-accent-teal">
                    {roundMoney(subtotal, 2)} € HT
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
