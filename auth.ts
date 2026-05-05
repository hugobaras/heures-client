import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? "local-dev-auth-secret-do-not-use-in-production"
      : undefined),
  providers: [
    Credentials({
      name: "Connexion",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;
        const email =
          typeof rawEmail === "string"
            ? rawEmail.trim().toLowerCase()
            : Array.isArray(rawEmail)
              ? String(rawEmail[0]).toLowerCase()
              : "";
        const password =
          typeof rawPassword === "string"
            ? rawPassword
            : Array.isArray(rawPassword)
              ? rawPassword[0]
              : "";
        if (!email || typeof password !== "string" || !password) return null;

        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = bcrypt.compareSync(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email.toLowerCase(),
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (typeof user.email === "string" && user.email) {
          token.email = user.email;
        }
        if (typeof user.name === "string") {
          token.name = user.name;
        } else if (user.name != null) {
          token.name = String(user.name);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (typeof token.email === "string" && token.email) {
          session.user.email = token.email;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
});
