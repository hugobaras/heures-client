"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-line-default bg-transparent px-3 py-1.5 text-xs text-fg-muted transition-colors hover:bg-card-elevated hover:text-fg"
    >
      Déconnexion
    </button>
  );
}
