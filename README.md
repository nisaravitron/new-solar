# Ek Badhyasi

A multi-tenant SaaS platform: any training center / coaching center / school
can sign up, submit its details, and get its own institute website. Ek
Badhyasi's super admin reviews and approves each institute; once approved,
the institute admin can activate their public website and manage their own
staff, teachers, students and parents.

## Roles

- **Super Admin** — runs the platform, approves/rejects/suspends institutes.
- **Institute Admin** — owns one institute: edits its public profile,
  activates/deactivates its website, adds teachers, staff, students and
  parents, posts notices.
- **Teacher / Staff** — view their institute's students, post notices.
- **Student** — views their own profile and their institute's notices.
- **Parent** — views their linked children and their institute's notices.

## Stack

Next.js 14 (App Router, TypeScript) + Prisma + NextAuth (credentials/JWT) +
Tailwind CSS. SQLite is used for local development (zero setup); swap the
`provider` in `prisma/schema.prisma` to `postgresql` and point
`DATABASE_URL` at a real database for production.

## Getting started

```bash
npm install
cp .env.example .env      # then edit NEXTAUTH_SECRET etc.
npm run db:push           # create the database
npm run db:seed           # creates the first Super Admin account
npm run dev
```

The seed script prints the Super Admin's email/password (also configurable
via `SEED_SUPER_ADMIN_*` env vars). Log in at `/login`, or register a new
institute at `/register`.

### Flow to try locally

1. Go to `/register` and submit a new institute — this creates the
   institute (status `PENDING`) and its admin account.
2. Log in as the Super Admin and open `/dashboard/super-admin` to approve it.
3. Log in as the institute admin and click **Activate my website** on
   `/dashboard/institute-admin` — the site is now live at `/site/<slug>`.
4. From `/dashboard/institute-admin/people`, add teachers, staff, students
   and parents (parents can be linked to one or more students).
5. Post notices from `/dashboard/institute-admin/notices` (teachers/staff
   can also post) — they show up on the public site and in every relevant
   dashboard.

## Notes

- Passwords are hashed with bcrypt; sessions are JWT-based via NextAuth.
- All `/dashboard/*` routes require auth (enforced in `src/middleware.ts`)
  and are further scoped per-role via `requireRole()` in
  `src/lib/rbac.ts`.
- This is a working scaffold covering the core multi-tenant approval/
  activation/RBAC flows — production hardening (email notifications, file
  uploads for logos, rate limiting, a Postgres migration, upgrading past
  Next 14 for the latest security patches) is still to do before going live.
