import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { InstituteActions } from "@/components/institute-actions";
import { INSTITUTE_TYPE_LABELS, type InstituteStatus, type InstituteType } from "@/lib/constants";

const statusTone: Record<InstituteStatus, "yellow" | "green" | "red" | "slate"> = {
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
  SUSPENDED: "slate",
};

export default async function SuperAdminPage() {
  await requireRole(["SUPER_ADMIN"]);

  const institutes = await prisma.institute.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { users: true, students: true } } },
  });

  const pending = institutes.filter((i) => i.status === "PENDING");
  const others = institutes.filter((i) => i.status !== "PENDING");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review new sign-ups and manage every institute on the Ek Badhyasi platform.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Pending approval {pending.length > 0 && <Badge tone="yellow">{pending.length}</Badge>}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing waiting on you right now.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {pending.map((inst) => (
              <Card key={inst.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{inst.name}</h3>
                      <Badge tone={statusTone[inst.status as InstituteStatus]}>{inst.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {INSTITUTE_TYPE_LABELS[inst.type as InstituteType] ?? inst.type} · {inst.city || "—"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {inst.contactEmail} · {inst.contactPhone}
                    </p>
                    {inst.description && <p className="mt-2 max-w-xl text-sm text-slate-600">{inst.description}</p>}
                  </div>
                  <InstituteActions id={inst.id} status={inst.status as InstituteStatus} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">All other institutes</h2>
        {others.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No institutes yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Live</th>
                  <th className="px-4 py-3">People</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {others.map((inst) => (
                  <tr key={inst.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{inst.name}</div>
                      <div className="text-xs text-slate-500">{inst.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3">{INSTITUTE_TYPE_LABELS[inst.type as InstituteType] ?? inst.type}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[inst.status as InstituteStatus]}>{inst.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{inst.isActive ? <Badge tone="green">Live</Badge> : <Badge>Offline</Badge>}</td>
                    <td className="px-4 py-3">
                      {inst._count.users} users · {inst._count.students} students
                    </td>
                    <td className="px-4 py-3">
                      <InstituteActions id={inst.id} status={inst.status as InstituteStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
