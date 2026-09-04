import Link from "next/link";
import { requireSession } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/constants";
import { SignOutButton } from "@/components/sign-out-button";

const NAV: Record<string, { href: string; label: string }[]> = {
  SUPER_ADMIN: [{ href: "/dashboard/super-admin", label: "Institutes" }],
  INSTITUTE_ADMIN: [
    { href: "/dashboard/institute-admin", label: "Overview" },
    { href: "/dashboard/institute-admin/profile", label: "Website profile" },
    { href: "/dashboard/institute-admin/people", label: "People" },
    { href: "/dashboard/institute-admin/notices", label: "Notices" },
  ],
  TEACHER: [{ href: "/dashboard/teacher", label: "My institute" }],
  STAFF: [{ href: "/dashboard/teacher", label: "My institute" }],
  STUDENT: [{ href: "/dashboard/student", label: "My institute" }],
  PARENT: [{ href: "/dashboard/parent", label: "My children" }],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const links = NAV[session.user.role] ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <Link href="/" className="text-lg font-bold text-brand-700">
            Ek Badhyasi
          </Link>
          <p className="mt-1 text-xs text-slate-500">{session.user.name}</p>
          <p className="text-xs font-medium text-brand-700">{ROLE_LABELS[session.user.role]}</p>

          <nav className="mt-6 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6">
            <SignOutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
