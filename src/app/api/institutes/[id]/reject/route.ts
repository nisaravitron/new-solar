import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

const schema = z.object({ reason: z.string().trim().max(500).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiRole(["SUPER_ADMIN"]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 422);

  const institute = await prisma.institute.findUnique({ where: { id: params.id } });
  if (!institute) return jsonError("Institute not found", 404);

  await prisma.institute.update({
    where: { id: institute.id },
    data: { status: "REJECTED", rejectionReason: parsed.data.reason || null, isActive: false },
  });

  return NextResponse.json({ ok: true });
}
