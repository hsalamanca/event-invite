import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { findUserByEmail, upsertOAuthUser } from "@/lib/users";

/** Auth.js auto-detects AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET; also accept CLIENT_* aliases. */
const googleClientId =
  process.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_CLIENT_ID || "";
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.AUTH_GOOGLE_CLIENT_SECRET ||
  "";
const googleConfigured = Boolean(googleClientId && googleClientSecret);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "select_account",
              },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const record = await upsertOAuthUser({
          email: user.email,
          name: user.name || "",
        });
        user.id = record.id;
        user.name = record.name;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const record = await findUserByEmail(user.email);
          token.sub = record?.id ?? user.id;
          token.email = record?.email ?? user.email;
          token.name = record?.name ?? user.name;
        } else {
          token.sub = user.id;
          token.email = user.email;
          token.name = user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = (token.email as string) ?? "";
        session.user.name = (token.name as string) ?? "";
      }
      return session;
    },
  },
});

export const isGoogleAuthEnabled = googleConfigured;
