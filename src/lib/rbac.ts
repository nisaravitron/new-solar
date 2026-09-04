import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/constants";
import { ROLE_DASHBOARD_PATH } from "@/lib/constants";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session;
}

/** Redirects to /login if unauthenticated, or to the user's own dashboard if
 * their role isn't in `roles`. Use at the top of a role-scoped page/layout. */
export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect(ROLE_DASHBOARD_PATH[session.user.role] ?? "/login");
  }
  return session;
}
