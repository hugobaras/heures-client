import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      slug: "standard",
      label: "Développement / standard",
      factor: 1,
      sortOrder: 0,
    },
    {
      slug: "travail-ensemble",
      label: "Travail ensemble",
      factor: 0.5,
      sortOrder: 1,
    },
  ] as const;

  for (const c of categories) {
    await prisma.timeCategory.upsert({
      where: { slug: c.slug },
      create: { ...c },
      update: { label: c.label, factor: c.factor, sortOrder: c.sortOrder },
    });
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev")
    .trim()
    .toLowerCase();
  const plainPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  const resetPassword =
    process.env.SEED_RESET_ADMIN_PASSWORD === "1" ||
    process.env.SEED_RESET_ADMIN_PASSWORD === "true";

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: "Administrateur",
    },
    update: {
      name: "Administrateur",
      ...(resetPassword ? { passwordHash } : {}),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
