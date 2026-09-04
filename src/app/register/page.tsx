"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { INSTITUTE_TYPES, INSTITUTE_TYPE_LABELS } from "@/lib/constants";

export default function RegisterInstitutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      instituteName: form.get("instituteName"),
      instituteType: form.get("instituteType"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      city: form.get("city"),
      address: form.get("address"),
      description: form.get("description"),
      adminName: form.get("adminName"),
      adminEmail: form.get("adminEmail"),
      adminPassword: form.get("adminPassword"),
    };

    try {
      const res = await fetch("/api/register-institute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <Card className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">Application submitted</h1>
          <p className="mt-3 text-sm text-slate-600">
            Thanks! Ek Badhyasi&apos;s super admin will review your institute&apos;s details.
            You&apos;ll be able to log in and activate your website as soon as it&apos;s approved.
          </p>
          <Button className="mt-6" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-brand-700">
        ← Back home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Register your institute</h1>
      <p className="mt-2 text-sm text-slate-600">
        Fill in your institute&apos;s details below. Once submitted, our super admin will review
        and approve your institute so you can activate your own website.
      </p>

      <Card className="mt-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Institute name">
              <Input name="instituteName" required maxLength={120} placeholder="Sharma Coaching Center" />
            </Field>
            <Field label="Institute type">
              <Select name="instituteType" required defaultValue="COACHING_CENTER">
                {INSTITUTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INSTITUTE_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Institute contact email">
              <Input name="contactEmail" type="email" required placeholder="contact@institute.com" />
            </Field>
            <Field label="Institute contact phone">
              <Input name="contactPhone" required placeholder="+91 90000 00000" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City">
              <Input name="city" placeholder="Jaipur" />
            </Field>
            <Field label="Address">
              <Input name="address" placeholder="Street, area" />
            </Field>
          </div>

          <Field label="About your institute (shown on your public website)">
            <Textarea name="description" rows={3} placeholder="We offer coaching for..." />
          </Field>

          <hr className="border-slate-200" />
          <p className="text-sm font-medium text-slate-700">Your admin login (you&apos;ll manage this institute)</p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name">
              <Input name="adminName" required maxLength={100} placeholder="Ramesh Sharma" />
            </Field>
            <Field label="Your email (used to log in)">
              <Input name="adminEmail" type="email" required placeholder="you@institute.com" />
            </Field>
          </div>

          <Field label="Choose a password">
            <Input name="adminPassword" type="password" required minLength={8} placeholder="At least 8 characters" />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit for approval"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
