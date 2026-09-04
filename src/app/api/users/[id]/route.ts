import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

const schema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiRole(["INSTITUTE_ADMIN"]);
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 422);

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return jsonError("User not found", 404);
  if (target.instituteId !== session!.user.instituteId) return jsonError("Not authorized", 403);
  if (target.role === "INSTITUTE_ADMIN") return jsonError("Cannot change status of an institute admin here", 400);

  await prisma.user.update({ where: { id: target.id }, data: { status: parsed.data.status } });

  return NextResponse.json({ ok: true });
}
