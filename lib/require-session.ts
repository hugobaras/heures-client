import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { isOwnerSession } from "@/lib/access";

export async function requireSession() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

export async function requireOwner() {
  const session = await requireSession();
  if (!isOwnerSession(session)) {
    redirect("/quotes");
  }
  return session;
}
