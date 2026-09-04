import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { CreateUserForm } from "@/components/create-user-form";
import { UserStatusToggle } from "@/components/user-status-toggle";
import { ROLE_LABELS, type Role, type UserStatus } from "@/lib/constants";

export default async function PeoplePage() {
  const session = await requireRole(["INSTITUTE_ADMIN"]);
  const instituteId = session.user.instituteId!;

  const [users, students] = await Promise.all([
    prisma.user.findMany({
      where: { instituteId, role: { in: ["TEACHER", "STAFF", "STUDENT", "PARENT"] } },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      include: {
        studentProfile: true,
        parentProfile: { include: { children: { include: { student: { include: { user: true } } } } } },
      },
    }),
    prisma.studentProfile.findMany({
      where: { instituteId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const studentOptions = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    rollNumber: s.rollNumber,
    className: s.className,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">People</h1>
        <p className="text-sm text-slate-600">Add teachers, staff, students and parents to your institute.</p>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">Add someone new</h2>
        <CreateUserForm students={studentOptions} />
      </Card>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No one added yet.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role as Role]}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">
                  {u.studentProfile && (
                    <span>
                      {u.studentProfile.rollNumber || "—"} {u.studentProfile.className ? `· ${u.studentProfile.className}` : ""}
                    </span>
                  )}
                  {u.parentProfile && (
                    <span>
                      {u.parentProfile.children.length > 0
                        ? u.parentProfile.children.map((c) => c.student.user.name).join(", ")
                        : "No children linked"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.status === "ACTIVE" ? "green" : "red"}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <UserStatusToggle userId={u.id} status={u.status as UserStatus as "ACTIVE" | "SUSPENDED"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
