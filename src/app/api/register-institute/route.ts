import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { INSTITUTE_TYPES, slugify } from "@/lib/constants";
import { jsonError } from "@/lib/api-helpers";

const schema = z.object({
  instituteName: z.string().trim().min(2).max(120),
  instituteType: z.enum(INSTITUTE_TYPES),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(6).max(20),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  adminName: z.string().trim().min(2).max(100),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().min(8).max(72),
});

async function uniqueSlug(base: string) {
  const root = slugify(base) || "institute";
  let slug = root;
  let n = 1;
  // small collision loop; institute count stays low enough for this to be cheap
  while (await prisma.institute.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const data = parsed.data;

  const existingAdmin = await prisma.user.findUnique({
    where: { email: data.adminEmail.toLowerCase().trim() },
  });
  if (existingAdmin) {
    return jsonError("An account with this admin email already exists.", 409);
  }

  const slug = await uniqueSlug(data.instituteName);
  const passwordHash = await bcrypt.hash(data.adminPassword, 10);

  const institute = await prisma.institute.create({
    data: {
      name: data.instituteName,
      slug,
      type: data.instituteType,
      status: "PENDING",
      isActive: false,
      contactEmail: data.contactEmail.toLowerCase().trim(),
      contactPhone: data.contactPhone,
      city: data.city || null,
      address: data.address || null,
      description: data.description || null,
      users: {
        create: {
          name: data.adminName,
          email: data.adminEmail.toLowerCase().trim(),
          passwordHash,
          role: "INSTITUTE_ADMIN",
          status: "PENDING",
        },
      },
    },
  });

  return NextResponse.json({ ok: true, slug: institute.slug }, { status: 201 });
}
