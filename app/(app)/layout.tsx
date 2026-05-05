import Link from "next/link";

import { auth } from "@/auth";
import { isOwnerSession } from "@/lib/access";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GridBackground } from "@/components/ui/grid-background";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ownerLinks = [
  { href: "/", label: "Tableau de bord" },
  { href: "/clients", label: "Clients" },
  { href: "/entries", label: "Saisies" },
  { href: "/quotes", label: "Devis" },
] as const;

const clientLinks = [{ href: "/quotes", label: "Mes devis" }] as const;

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const owner = isOwnerSession(session);
  const links = owner ? ownerLinks : clientLinks;

  return (
    <div className="relative min-h-full">
      <GridBackground className="opacity-90" />
      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-line-default/80 bg-background/75 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-card-elevated hover:text-fg",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <SignOutButton />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
