"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

function isCredentialsFailure(error: unknown): boolean {
  return (
    error instanceof CredentialsSignin ||
    (typeof error === "object" &&
      error !== null &&
      "type" in error &&
      (error as { type: string }).type === "CredentialsSignin")
  );
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  if (!email) {
    return { error: "L’e-mail est requis." };
  }
  if (!password) {
    return { error: "Le mot de passe est requis." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: "/",
    });
  } catch (error) {
    if (isCredentialsFailure(error)) {
      return { error: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }

  redirect("/");
}
