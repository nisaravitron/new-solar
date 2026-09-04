"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-brand-700">
        ← Back home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Super admin, institute admin, teacher, staff, student or parent — log in here.
      </p>

      <Card className="mt-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Email">
            <Input name="email" type="email" required autoFocus />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600">
        Running an institute?{" "}
        <Link href="/register" className="font-medium text-brand-700">
          Register it here
        </Link>
      </p>
    </main>
  );
}
