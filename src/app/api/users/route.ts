import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { STAFF_CREATABLE_ROLES } from "@/lib/constants";
import { requireApiRole, jsonError } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(STAFF_CREATABLE_ROLES),
  rollNumber: z.string().trim().max(40).optional(),
  className: z.string().trim().max(60).optional(),
  studentProfileIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requireApiRole(["INSTITUTE_ADMIN"]);
  if (error) return error;
  const instituteId = session!.user.instituteId;
  if (!instituteId) return jsonError("No institute on this account", 400);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (existing) return jsonError("A user with this email already exists.", 409);

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role,
      status: "ACTIVE",
      instituteId,
      ...(data.role === "STUDENT"
        ? {
            studentProfile: {
              create: {
                instituteId,
                rollNumber: data.rollNumber || null,
                className: data.className || null,
              },
            },
          }
        : {}),
      ...(data.role === "PARENT" ? { parentProfile: { create: {} } } : {}),
    },
    include: { studentProfile: true, parentProfile: true },
  });

  if (data.role === "PARENT" && data.studentProfileIds?.length && user.parentProfile) {
    const validStudents = await prisma.studentProfile.findMany({
      where: { id: { in: data.studentProfileIds }, instituteId },
      select: { id: true },
    });
    if (validStudents.length) {
      await prisma.parentStudent.createMany({
        data: validStudents.map((s) => ({ parentId: user.parentProfile!.id, studentId: s.id })),
      });
    }
  }

  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}
