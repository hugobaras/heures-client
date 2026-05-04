import { Prisma } from "@prisma/client";

export type EntryLike = {
  durationMinutes: number;
  appliedFactor: Prisma.Decimal | string | number;
};

function toNumber(d: EntryLike["appliedFactor"]): number {
  if (typeof d === "number") return d;
  if (typeof d === "string") return Number(d);
  return d.toNumber();
}

/** Heures brutes (durée saisie). */
export function rawHoursFromEntries(entries: EntryLike[]): number {
  const minutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  return minutes / 60;
}

/** Heures facturables : Σ (durée × coefficient snapshot). */
export function billableHoursFromEntries(entries: EntryLike[]): number {
  let billableMinutes = 0;
  for (const e of entries) {
    billableMinutes += e.durationMinutes * toNumber(e.appliedFactor);
  }
  return billableMinutes / 60;
}

export function roundMoney(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function roundHours(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
