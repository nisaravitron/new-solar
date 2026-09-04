import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { NoticeBoard } from "@/components/notice-board";

export default async function ParentDashboard() {
  const session = await requireRole(["PARENT"]);

  const profile = await prisma.parentProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    include: {
      children: {
        include: { student: { include: { user: true, institute: true } } },
      },
    },
  });

  const instituteIds = Array.from(new Set(profile.children.map((c) => c.student.instituteId)));
  const notices = instituteIds.length
    ? await prisma.notice.findMany({
        where: { instituteId: { in: instituteIds } },
        orderBy: { createdAt: "desc" },
        include: { author: true, institute: true },
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My children</h1>
      </div>

      {profile.children.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No children linked to your account yet. Contact your institute admin.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.children.map((c) => (
            <Card key={c.id}>
              <h3 className="font-semibold text-slate-900">{c.student.user.name}</h3>
              <p className="text-sm text-slate-600">{c.student.institute.name}</p>
              <p className="text-sm text-slate-500">
                {c.student.rollNumber || "—"} {c.student.className ? `· ${c.student.className}` : ""}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Notices</h2>
        <NoticeBoard
          notices={notices.map((n) => ({
            id: n.id,
            title: `${n.title} (${n.institute.name})`,
            content: n.content,
            createdAt: n.createdAt.toISOString(),
            authorId: n.authorId,
            authorName: n.author.name,
          }))}
          currentUserId={session.user.id}
          canPost={false}
          canDeleteAny={false}
        />
      </div>
    </div>
  );
}
