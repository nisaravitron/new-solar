import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { InstituteProfileForm } from "@/components/institute-profile-form";

export default async function InstituteProfilePage() {
  const session = await requireRole(["INSTITUTE_ADMIN"]);
  const institute = await prisma.institute.findUniqueOrThrow({ where: { id: session.user.instituteId! } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Website profile</h1>
        <p className="text-sm text-slate-600">
          This information appears on your public website once it&apos;s activated.
        </p>
      </div>
      <Card>
        <InstituteProfileForm institute={institute} />
      </Card>
    </div>
  );
}
