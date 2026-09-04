import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

const schema = z.object({ action: z.enum(["suspend", "reactivate"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiRole(["SUPER_ADMIN"]);
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 422);

  const institute = await prisma.institute.findUnique({ where: { id: params.id } });
  if (!institute) return jsonError("Institute not found", 404);

  if (parsed.data.action === "suspend") {
    await prisma.institute.update({
      where: { id: institute.id },
      data: { status: "SUSPENDED", isActive: false, suspendedAt: new Date() },
    });
  } else {
    if (institute.status !== "SUSPENDED") return jsonError("Institute is not suspended", 409);
    await prisma.institute.update({
      where: { id: institute.id },
      data: { status: "APPROVED", suspendedAt: null },
    });
  }

  return NextResponse.json({ ok: true });
}
