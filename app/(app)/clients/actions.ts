"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/access";
import { requireOwner } from "@/lib/require-session";

function parseRate(input: string): Prisma.Decimal | null {
  const n = Number.parseFloat(input.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return new Prisma.Decimal(n);
}

function bailClients(message: string): never {
  redirect(`/clients?error=${encodeURIComponent(message)}`);
}

export async function createClientAction(formData: FormData) {
  await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw.length ? normalizeEmail(emailRaw) : null;
  const rate = parseRate(String(formData.get("defaultRate") ?? ""));
  if (!name || !rate) {
    bailClients("Nom et tarif horaire valides requis.");
  }
  await prisma.client.create({
    data: { name, email, defaultRate: rate },
  });
  revalidatePath("/clients");
  revalidatePath("/");
  revalidatePath("/entries");
}

export async function updateClientAction(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw.length ? normalizeEmail(emailRaw) : null;
  const rate = parseRate(String(formData.get("defaultRate") ?? ""));
  if (!id || !name || !rate) {
    bailClients("Champs invalides.");
  }
  await prisma.client.update({
    where: { id },
    data: { name, email, defaultRate: rate },
  });
  revalidatePath("/clients");
  revalidatePath("/");
  revalidatePath("/entries");
}

export async function deleteClientAction(id: string) {
  await requireOwner();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  revalidatePath("/");
  revalidatePath("/entries");
  revalidatePath("/quotes");
}
