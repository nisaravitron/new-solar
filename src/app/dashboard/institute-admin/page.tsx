import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { ActivateToggle } from "@/components/activate-toggle";
import { INSTITUTE_TYPE_LABELS, type InstituteType } from "@/lib/constants";

export default async function InstituteAdminOverview() {
  const session = await requireRole(["INSTITUTE_ADMIN"]);
  const instituteId = session.user.instituteId!;

  const institute = await prisma.institute.findUniqueOrThrow({
    where: { id: instituteId },
    include: {
      _count: { select: { students: true, notices: true } },
    },
  });

  const [teacherCount, staffCount, parentCount] = await Promise.all([
    prisma.user.count({ where: { instituteId, role: "TEACHER" } }),
    prisma.user.count({ where: { instituteId, role: "STAFF" } }),
    prisma.user.count({ where: { instituteId, role: "PARENT" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{institute.name}</h1>
        <p className="text-sm text-slate-600">
          {INSTITUTE_TYPE_LABELS[institute.type as InstituteType] ?? institute.type}
        </p>
      </div>

      {institute.status === "PENDING" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">
            <strong>Awaiting approval.</strong> Ek Badhyasi&apos;s super admin is reviewing your institute.
            You&apos;ll be able to activate your website once approved.
          </p>
        </Card>
      )}
      {institute.status === "REJECTED" && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-800">
            <strong>Application rejected.</strong>{" "}
            {institute.rejectionReason || "Contact Ek Badhyasi support for details."}
          </p>
        </Card>
      )}
      {institute.status === "SUSPENDED" && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-800">
            <strong>Your institute is suspended.</strong> Your website is offline. Contact Ek Badhyasi support.
          </p>
        </Card>
      )}

      {institute.status === "APPROVED" && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900">
                Website status: {institute.isActive ? <Badge tone="green">Live</Badge> : <Badge>Offline</Badge>}
              </p>
              {institute.isActive && (
                <Link href={`/site/${institute.slug}`} className="text-sm text-brand-700" target="_blank">
                  View your public website →
                </Link>
              )}
            </div>
            <ActivateToggle instituteId={institute.id} isActive={institute.isActive} />
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-2xl font-bold text-slate-900">{institute._count.students}</p>
          <p className="text-sm text-slate-500">Students</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-slate-900">{teacherCount}</p>
          <p className="text-sm text-slate-500">Teachers</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-slate-900">{staffCount}</p>
          <p className="text-sm text-slate-500">Staff</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-slate-900">{parentCount}</p>
          <p className="text-sm text-slate-500">Parents</p>
        </Card>
      </div>
    </div>
  );
}
