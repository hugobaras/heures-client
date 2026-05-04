"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import {
  billableHoursFromEntries,
  roundHours,
  roundMoney,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

function parseDateOnly(input: string): Date | null {
  const s = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseVat(input: string | null): Prisma.Decimal | null {
  if (input == null || input === "") return null;
  const n = Number.parseFloat(String(input).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return new Prisma.Decimal(n);
}

type EntryRow = {
  durationMinutes: number;
  appliedFactor: Prisma.Decimal;
  category: { label: string };
};

function groupLinesForQuote(
  entries: EntryRow[],
  unitPrice: Prisma.Decimal,
): {
  label: string;
  billableHours: number;
  unitPrice: Prisma.Decimal;
  sortOrder: number;
}[] {
  const map = new Map<string, { label: string; billableMinutes: number }>();
  for (const e of entries) {
    const key = e.category.label;
    const prev = map.get(key) ?? {
      label: e.category.label,
      billableMinutes: 0,
    };
    const factor = e.appliedFactor.toNumber();
    prev.billableMinutes += e.durationMinutes * factor;
    map.set(key, prev);
  }
  const rows = [...map.values()].map((v) => ({
    label: v.label,
    billableHours: roundHours(v.billableMinutes / 60, 2),
    unitPrice,
    sortOrder: 0,
  }));
  rows.sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return rows.map((r, i) => ({ ...r, sortOrder: i }));
}

function bailToNew(message: string): never {
  redirect(`/quotes/new?error=${encodeURIComponent(message)}`);
}

export async function createQuoteAction(formData: FormData) {
  await requireSession();
  const clientId = String(formData.get("clientId") ?? "");
  const periodStart = parseDateOnly(String(formData.get("periodStart") ?? ""));
  const periodEnd = parseDateOnly(String(formData.get("periodEnd") ?? ""));
  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw.length ? titleRaw : null;
  const vat = parseVat(String(formData.get("vatRate") ?? ""));

  if (!clientId || !periodStart || !periodEnd || periodEnd < periodStart) {
    bailToNew("Client et période valides requis.");
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) bailToNew("Client introuvable.");

  const entries = await prisma.timeEntry.findMany({
    where: {
      clientId,
      date: { gte: periodStart, lte: periodEnd },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });
  if (entries.length === 0) bailToNew("Aucune saisie sur cette période.");

  const billable = billableHoursFromEntries(entries);
  if (billable <= 0) bailToNew("Heures facturables nulles.");

  const lineInputs = groupLinesForQuote(entries, client.defaultRate);
  const linesData = lineInputs.map((l) => {
    const lineTotal = roundMoney(l.billableHours * l.unitPrice.toNumber(), 2);
    return {
      label: l.label,
      billableHours: new Prisma.Decimal(l.billableHours),
      unitPrice: l.unitPrice,
      lineTotal: new Prisma.Decimal(lineTotal),
      sortOrder: l.sortOrder,
    };
  });

  const quote = await prisma.quote.create({
    data: {
      clientId,
      title,
      periodStart,
      periodEnd,
      vatRate: vat,
      lines: { create: linesData },
    },
  });

  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}
