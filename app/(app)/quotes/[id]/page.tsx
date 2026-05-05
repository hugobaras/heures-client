import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { canAccessQuoteForClient } from "@/lib/access";
import { roundMoney } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function QuoteDetailPage(props: Props) {
  const { id } = await props.params;
  const session = await auth();
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) notFound();
  if (!canAccessQuoteForClient(session, quote.client.email)) notFound();

  const subtotal = quote.lines.reduce((s, l) => s + l.lineTotal.toNumber(), 0);
  const vatRate = quote.vatRate?.toNumber() ?? null;
  const vatAmount = vatRate != null ? roundMoney(subtotal * vatRate, 2) : null;
  const totalTtc =
    vatAmount != null ? roundMoney(subtotal + vatAmount, 2) : subtotal;

  const pdfHref = `/api/quotes/${quote.id}/pdf`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/quotes" className="text-sm text-fg-muted hover:text-fg">
          ← Devis
        </Link>
        <h1 className="mt-4 font-display text-3xl text-gradient">
          {quote.title?.trim() || "Devis"}
        </h1>
        <p className="mt-2 text-fg-subtle">
          {quote.client.name} — du{" "}
          {quote.periodStart.toLocaleDateString("fr-FR")} au{" "}
          {quote.periodEnd.toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={pdfHref}
          className="inline-flex items-center justify-center rounded-xl bg-accent-teal/20 px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-accent-teal/40 hover:bg-accent-teal/30"
        >
          Télécharger le PDF
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line-default">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-line-default bg-card-elevated">
            <tr className="text-fg-muted">
              <th className="px-4 py-3">Prestation</th>
              <th className="px-4 py-3 text-right">Heures facturables</th>
              <th className="px-4 py-3 text-right">PU HT</th>
              <th className="px-4 py-3 text-right">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l) => (
              <tr key={l.id} className="border-b border-line-default/80">
                <td className="px-4 py-3 text-fg">{l.label}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {l.billableHours.toString()} h
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {roundMoney(l.unitPrice.toNumber(), 2)} €
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {roundMoney(l.lineTotal.toNumber(), 2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-xs space-y-2 font-mono text-sm">
        <div className="flex justify-between text-fg-muted">
          <span>Total HT</span>
          <span>{roundMoney(subtotal, 2)} €</span>
        </div>
        {vatRate != null && vatAmount != null ? (
          <>
            <div className="flex justify-between text-fg-muted">
              <span>TVA ({(vatRate * 100).toFixed(1)} %)</span>
              <span>{roundMoney(vatAmount, 2)} €</span>
            </div>
            <div className="flex justify-between text-fg">
              <span className="font-medium">Total TTC</span>
              <span>{roundMoney(totalTtc, 2)} €</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
