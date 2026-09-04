import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@ekbadhyasi.com").toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "ChangeMe@123";
  const name = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" },
  });

  console.log(`Created super admin: ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
