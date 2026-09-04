import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { NoticeBoard } from "@/components/notice-board";

export default async function TeacherDashboard() {
  const session = await requireRole(["TEACHER", "STAFF"]);
  const instituteId = session.user.instituteId!;

  const [institute, students, notices] = await Promise.all([
    prisma.institute.findUniqueOrThrow({ where: { id: instituteId } }),
    prisma.studentProfile.findMany({
      where: { instituteId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notice.findMany({
      where: { instituteId },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{institute.name}</h1>
        <p className="text-sm text-slate-600">{students.length} students enrolled</p>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-900">Students</h2>
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">No students yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {students.map((s) => (
              <li key={s.id} className="flex justify-between py-2">
                <span className="text-slate-900">{s.user.name}</span>
                <span className="text-slate-500">
                  {s.rollNumber || "—"} {s.className ? `· ${s.className}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
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
          canPost
          canDeleteAny={false}
        />
      </div>
    </div>
  );
}
