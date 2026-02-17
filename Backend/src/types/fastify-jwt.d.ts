import "@fastify/jwt";
import type { UserRole } from "./index";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string; role: UserRole };
    user: { id: string; email: string; role: UserRole };
  }
}
