"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { GridBackground } from "@/components/ui/grid-background";

import { login } from "./actions";

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") !== "1") return null;
  return (
    <p
      className="rounded-xl border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-sm text-fg"
      role="status"
    >
      Compte créé. Vous pouvez vous connecter.
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4">
      <GridBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="glass rounded-2xl p-6 shadow-lg">
          <h1 className="font-display text-2xl text-fg">Connexion</h1>
          <p className="mt-1 text-sm text-fg-subtle">
            Accès au compteur d’heures
          </p>
          <Suspense fallback={null}>
            <div className="mt-4">
              <RegisteredBanner />
            </div>
          </Suspense>
          <form action={formAction} className="mt-6 space-y-4">
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">E-mail</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none ring-accent-amber/30 transition-shadow focus:ring-2"
                required
              />
            </label>
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">Mot de passe</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none ring-accent-amber/30 transition-shadow focus:ring-2"
                required
              />
            </label>
            {state?.error ? (
              <p className="text-sm text-accent-clay" role="alert">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-button-solid-bg px-4 py-2.5 text-sm font-medium text-button-solid-fg transition-colors hover:bg-button-solid-bg-hover disabled:opacity-60"
            >
              {pending ? "Connexion…" : "Se connecter"}
            </button>
            <p className="text-center text-sm text-fg-muted">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-medium text-accent-amber hover:underline"
              >
                S’inscrire
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
