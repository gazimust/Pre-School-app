import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string;
      email: string;
      /** Null only for PLATFORM_ADMIN, who is not scoped to a nursery. */
      nurseryId: string | null;
      /** Set while a platform admin is impersonating a nursery user; holds the platform admin's user id. */
      impersonatorId?: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    name: string;
    email: string;
    nurseryId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    nurseryId: string | null;
    impersonatorId?: string | null;
  }
}
