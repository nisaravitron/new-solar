import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Returns the session, or writes a 401/403 response and returns null. */
export async function requireApiRole(roles: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: jsonError("Not authenticated", 401) };
  }
  if (!roles.includes(session.user.role)) {
    return { session: null, error: jsonError("Not authorized", 403) };
  }
  return { session, error: null };
}
