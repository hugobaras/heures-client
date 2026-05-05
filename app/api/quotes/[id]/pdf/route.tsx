import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/auth";
import { canAccessQuoteForClient } from "@/lib/access";
import { roundMoney } from "@/lib/billing";
import { DevisPdfDocument } from "@/lib/pdf/devis-document";
import { prisma } from "@/lib/prisma";

function issuerFromEnv() {
  const name = process.env.INVOICE_COMPANY_NAME?.trim() || "Freelance";
  return {
    name,
    siret: process.env.INVOICE_SIRET?.trim(),
    vatNumber: process.env.INVOICE_VAT_NUMBER?.trim(),
    address: process.env.INVOICE_ADDRESS?.trim(),
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { id } = await ctx.params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!quote) {
    return new Response("Devis introuvable", { status: 404 });
  }
  if (!canAccessQuoteForClient(session, quote.client.email)) {
    return new Response("Non autorisé", { status: 403 });
  }

  const subtotal = quote.lines.reduce((s, l) => s + l.lineTotal.toNumber(), 0);
  const vatRateNum = quote.vatRate?.toNumber() ?? null;
  const vatAmount =
    vatRateNum != null ? roundMoney(subtotal * vatRateNum, 2) : null;
  const totalTtc =
    vatAmount != null ? roundMoney(subtotal + vatAmount, 2) : subtotal;

  const periodLabel = `Du ${quote.periodStart.toLocaleDateString("fr-FR")} au ${quote.periodEnd.toLocaleDateString("fr-FR")}`;
  const createdLabel = quote.createdAt.toLocaleDateString("fr-FR", {
    dateStyle: "long",
  });

  const el = (
    <DevisPdfDocument
      issuer={issuerFromEnv()}
      clientName={quote.client.name}
      clientEmail={quote.client.email}
      quoteTitle={quote.title}
      documentRef={`DEV-${quote.id.slice(0, 8).toUpperCase()}`}
      periodLabel={periodLabel}
      createdLabel={createdLabel}
      lines={quote.lines}
      subtotal={roundMoney(subtotal, 2)}
      vatRate={vatRateNum}
      vatAmount={vatAmount}
      totalTtc={totalTtc}
      currency="EUR"
    />
  );

  const buffer = await renderToBuffer(el);
  const filename = `devis-${quote.id.slice(0, 8)}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
