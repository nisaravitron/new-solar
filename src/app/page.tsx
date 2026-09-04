import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-brand-700">Ek Badhyasi</span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-brand-700">
              Log in
            </Link>
            <Link href="/register">
              <Button>Register your institute</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Every training center deserves its own website
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Ek Badhyasi is a SaaS platform: sign up, submit your details, and get your own institute
          website. Our super admin reviews and approves your institute, then you go live —
          complete with panels for staff, teachers, students and parents.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register">
            <Button className="px-6 py-3 text-base">Get started — it&apos;s free</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="px-6 py-3 text-base">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <h3 className="font-semibold text-slate-900">1. Sign up</h3>
            <p className="mt-2 text-sm text-slate-600">
              Any coaching, training center, school or college can register and submit its details.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">2. Get approved</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ek Badhyasi&apos;s super admin reviews every submission and approves genuine institutes.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">3. Go live</h3>
            <p className="mt-2 text-sm text-slate-600">
              Once approved, the institute admin activates their own public website in one click.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">4. Manage everyone</h3>
            <p className="mt-2 text-sm text-slate-600">
              Institute admins add teachers, staff, students and parents — each with their own panel.
            </p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Ek Badhyasi. Built for training centers, by Ek Badhyasi.
      </footer>
    </main>
  );
}
