import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;

        const student = await prisma.student.findUnique({
          where: { userId: credentials.userId },
        });

        if (!student) return null;

        const isValid = await compare(credentials.password, student.password);
        if (!isValid) return null;

        return {
          id: student.id,
          userId: student.userId,
          mustChangePassword: student.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).userId;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        userId: token.userId as string,
        mustChangePassword: token.mustChangePassword as boolean,
      };
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
