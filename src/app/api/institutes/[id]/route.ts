import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-helpers";

const schema = z.object({
  description: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  contactPhone: z.string().trim().min(6).max(20).optional(),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return jsonError("Not authenticated", 401);
  if (session.user.role !== "INSTITUTE_ADMIN" || session.user.instituteId !== params.id) {
    return jsonError("Not authorized", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

  const institute = await prisma.institute.findUnique({ where: { id: params.id } });
  if (!institute) return jsonError("Institute not found", 404);

  if (parsed.data.isActive && institute.status !== "APPROVED") {
    return jsonError("Institute must be approved by Ek Badhyasi before it can go live.", 409);
  }

  const { logoUrl, ...rest } = parsed.data;

  const updated = await prisma.institute.update({
    where: { id: institute.id },
    data: {
      ...rest,
      ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, isActive: updated.isActive });
}
