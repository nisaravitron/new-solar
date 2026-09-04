import { redirect } from "next/navigation";
import { requireSession } from "@/lib/rbac";
import { ROLE_DASHBOARD_PATH } from "@/lib/constants";

export default async function DashboardIndex() {
  const session = await requireSession();
  redirect(ROLE_DASHBOARD_PATH[session.user.role] ?? "/login");
}
