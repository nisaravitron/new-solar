import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiRole(["SUPER_ADMIN"]);
  if (error) return error;

  const institute = await prisma.institute.findUnique({ where: { id: params.id } });
  if (!institute) return jsonError("Institute not found", 404);
  if (institute.status === "APPROVED") return jsonError("Institute is already approved", 409);

  await prisma.$transaction([
    prisma.institute.update({
      where: { id: institute.id },
      data: { status: "APPROVED", approvedAt: new Date(), rejectionReason: null, suspendedAt: null },
    }),
    prisma.user.updateMany({
      where: { instituteId: institute.id, role: "INSTITUTE_ADMIN", status: "PENDING" },
      data: { status: "ACTIVE" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
