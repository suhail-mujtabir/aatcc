import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    userId: string;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    mustChangePassword: boolean;
  }
}
