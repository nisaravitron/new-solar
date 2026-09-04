import type { Role, UserStatus } from "@/lib/constants";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    status: UserStatus;
    instituteId: string | null;
    instituteSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      instituteId: string | null;
      instituteSlug: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
    instituteId: string | null;
    instituteSlug: string | null;
  }
}
