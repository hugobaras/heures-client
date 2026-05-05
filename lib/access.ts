import type { Session } from "next-auth";

export function normalizeEmail(s: string | null | undefined): string | null {
  const t = s?.trim().toLowerCase();
  return t || null;
}

export function getOwnerEmailEnv(): string | null {
  return normalizeEmail(process.env.APP_OWNER_EMAIL);
}

/**
 * Si `APP_OWNER_EMAIL` n’est pas défini, tout utilisateur connecté est traité comme
 * propriétaire (comportement historique).
 */
export function isOwnerSession(session: Session | null): boolean {
  if (!session?.user) return false;
  const owner = getOwnerEmailEnv();
  if (!owner) return true;
  const user = normalizeEmail(session.user.email);
  return Boolean(user && user === owner);
}

export function canAccessQuoteForClient(
  session: Session | null,
  quoteClientEmail: string | null | undefined,
): boolean {
  if (!session?.user) return false;
  if (isOwnerSession(session)) return true;
  const u = normalizeEmail(session.user.email);
  const c = normalizeEmail(quoteClientEmail);
  return Boolean(u && c && u === c);
}
