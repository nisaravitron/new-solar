import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { NoticeBoard } from "@/components/notice-board";

export default async function StudentDashboard() {
  const session = await requireRole(["STUDENT"]);

  const profile = await prisma.studentProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    include: { institute: true },
  });

  const notices = await prisma.notice.findMany({
    where: { instituteId: profile.instituteId },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{profile.institute.name}</h1>
        <p className="text-sm text-slate-600">
          Roll no. {profile.rollNumber || "—"} {profile.className ? `· ${profile.className}` : ""}
        </p>
      </div>

      <Card>
        <h2 className="mb-2 font-semibold text-slate-900">My profile</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd className="text-slate-900">{session.user.name}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{session.user.email}</dd>
        </dl>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Notices</h2>
        <NoticeBoard
          notices={notices.map((n) => ({
            id: n.id,
            title: n.title,
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
