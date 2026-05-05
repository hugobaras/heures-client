"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-session";

function parseDateOnly(input: string): Date | null {
  const s = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function bailEntries(message: string): never {
  redirect(`/entries?error=${encodeURIComponent(message)}`);
}

export async function createTimeEntryAction(formData: FormData) {
  await requireOwner();
  const clientId = String(formData.get("clientId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const date = parseDateOnly(String(formData.get("date") ?? ""));
  const durationRaw = String(formData.get("durationHours") ?? "").replace(
    ",",
    ".",
  );
  const hours = Number.parseFloat(durationRaw);
  const note = String(formData.get("note") ?? "").trim() || null;
  if (
    !clientId ||
    !categoryId ||
    !date ||
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    bailEntries("Client, catégorie, date et durée (h) requis.");
  }
  const durationMinutes = Math.round(hours * 60);
  if (durationMinutes < 1) bailEntries("Durée trop courte.");
  const cat = await prisma.timeCategory.findUnique({
    where: { id: categoryId },
  });
  if (!cat) bailEntries("Catégorie introuvable.");
  await prisma.timeEntry.create({
    data: {
      clientId,
      categoryId,
      appliedFactor: cat.factor,
      date,
      durationMinutes,
      note,
    },
  });
  revalidatePath("/entries");
  revalidatePath("/");
  revalidatePath("/quotes");
}

export async function deleteTimeEntryAction(id: string) {
  await requireOwner();
  await prisma.timeEntry.delete({ where: { id } });
  revalidatePath("/entries");
  revalidatePath("/");
  revalidatePath("/quotes");
}
