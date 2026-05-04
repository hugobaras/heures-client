"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export type RegisterState = { error?: string } | undefined;

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  const name = field(formData, "name").trim() || null;

  if (!email) {
    return { error: "L’e-mail est requis." };
  }
  if (!password) {
    return { error: "Le mot de passe est requis." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet e-mail." };
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  redirect("/login?registered=1");
}
