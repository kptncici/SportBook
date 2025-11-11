import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client"; // ✅ gunakan enum Role dari Prisma biar sinkron

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role; // ✅ langsung pakai Role enum Prisma
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: Role;
  }
}
