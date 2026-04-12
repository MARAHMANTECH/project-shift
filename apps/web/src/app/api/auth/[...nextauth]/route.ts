// NextAuth.js API Route Handler
// Catch-all route der håndterer /api/auth/* endpoints
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
