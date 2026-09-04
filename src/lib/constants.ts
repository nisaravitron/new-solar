// Single source of truth for the string-enum-like fields stored in SQLite
// (see prisma/schema.prisma for why these aren't native Prisma enums).

export const ROLES = [
  "SUPER_ADMIN",
  "INSTITUTE_ADMIN",
  "TEACHER",
  "STAFF",
  "STUDENT",
  "PARENT",
] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_CREATABLE_ROLES = ["TEACHER", "STAFF", "STUDENT", "PARENT"] as const;

export const USER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const INSTITUTE_TYPES = [
  "COACHING_CENTER",
  "TRAINING_CENTER",
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "OTHER",
] as const;
export type InstituteType = (typeof INSTITUTE_TYPES)[number];

export const INSTITUTE_TYPE_LABELS: Record<InstituteType, string> = {
  COACHING_CENTER: "Coaching Center",
  TRAINING_CENTER: "Training Center",
  SCHOOL: "School",
  COLLEGE: "College",
  UNIVERSITY: "University",
  OTHER: "Other",
};

export const INSTITUTE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type InstituteStatus = (typeof INSTITUTE_STATUSES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  INSTITUTE_ADMIN: "Institute Admin",
  TEACHER: "Teacher",
  STAFF: "Staff",
  STUDENT: "Student",
  PARENT: "Parent",
};

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  INSTITUTE_ADMIN: "/dashboard/institute-admin",
  TEACHER: "/dashboard/teacher",
  STAFF: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
