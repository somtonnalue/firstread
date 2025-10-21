/**
 * NextAuth.js API Route - Infrastructure Layer
 * Handles authentication requests
 */

import { handlers } from "@/lib/auth";

export const runtime = "nodejs";

export const { GET, POST } = handlers;
