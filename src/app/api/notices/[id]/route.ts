import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiRole(["INSTITUTE_ADMIN", "TEACHER", "STAFF"]);
  if (error) return error;

  const notice = await prisma.notice.findUnique({ where: { id: params.id } });
  if (!notice) return jsonError("Notice not found", 404);
  if (notice.instituteId !== session!.user.instituteId) return jsonError("Not authorized", 403);
  if (notice.authorId !== session!.user.id && session!.user.role !== "INSTITUTE_ADMIN") {
    return jsonError("Only the author or the institute admin can delete this notice", 403);
  }

  await prisma.notice.delete({ where: { id: notice.id } });
  return NextResponse.json({ ok: true });
}
