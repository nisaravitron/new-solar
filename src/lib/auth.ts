import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@/lib/constants";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { institute: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        if (user.status === "SUSPENDED") {
          throw new Error("Your account has been suspended. Contact your institute admin.");
        }
        if (user.status === "PENDING" && user.role === "INSTITUTE_ADMIN") {
          throw new Error(
            "Your institute is still awaiting Ek Badhyasi approval. We'll email you once it's live."
          );
        }
        if (user.instituteId && user.institute?.status === "SUSPENDED") {
          throw new Error("Your institute's account is currently suspended.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          status: user.status as UserStatus,
          instituteId: user.instituteId,
          instituteSlug: user.institute?.slug ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.instituteId = user.instituteId;
        token.instituteSlug = user.instituteSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.instituteId = token.instituteId;
        session.user.instituteSlug = token.instituteSlug;
      }
      return session;
    },
  },
};
