import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(2).max(4000),
});

export async function POST(req: Request) {
  const { session, error } = await requireApiRole(["INSTITUTE_ADMIN", "TEACHER", "STAFF"]);
  if (error) return error;
  const instituteId = session!.user.instituteId;
  if (!instituteId) return jsonError("No institute on this account", 400);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

  const notice = await prisma.notice.create({
    data: {
      instituteId,
      authorId: session!.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ ok: true, id: notice.id }, { status: 201 });
}
