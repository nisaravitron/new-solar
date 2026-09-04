import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NoticeBoard } from "@/components/notice-board";

export default async function InstituteAdminNoticesPage() {
  const session = await requireRole(["INSTITUTE_ADMIN"]);
  const notices = await prisma.notice.findMany({
    where: { instituteId: session.user.instituteId! },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
        <p className="text-sm text-slate-600">Posted notices appear on your public website too.</p>
      </div>
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
        canPost
        canDeleteAny
      />
    </div>
  );
}
