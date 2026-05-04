"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { GridBackground } from "@/components/ui/grid-background";

import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4">
      <GridBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="glass rounded-2xl p-6 shadow-lg">
          <h1 className="font-display text-2xl text-fg">Créer un compte</h1>
          <p className="mt-1 text-sm text-fg-subtle">
            Compte local — données stockées dans votre base.
          </p>
          <form action={formAction} className="mt-6 space-y-4">
            <label className="block text-sm text-fg-muted">
              <span className="mb-1 block">Nom (optionnel)</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none ring-accent-amber/30 transition-shadow focus:ring-2"
              />
            </label>
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
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-xl border border-line-default bg-card-elevated px-3 py-2 text-fg outline-none ring-accent-amber/30 transition-shadow focus:ring-2"
                required
              />
              <span className="mt-0.5 block text-xs text-fg-subtle">
                Au moins 8 caractères.
              </span>
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
              {pending ? "Création…" : "Créer le compte"}
            </button>
            <p className="text-center text-sm text-fg-muted">
              Déjà inscrit ?{" "}
              <Link
                href="/login"
                className="font-medium text-accent-amber hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
