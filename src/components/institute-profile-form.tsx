"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Textarea } from "@/components/ui";

type Institute = {
  id: string;
  description: string | null;
  address: string | null;
  city: string | null;
  contactPhone: string;
  logoUrl: string | null;
};

export function InstituteProfileForm({ institute }: { institute: Institute }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/institutes/${institute.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.get("description"),
          address: form.get("address"),
          city: form.get("city"),
          contactPhone: form.get("contactPhone"),
          logoUrl: form.get("logoUrl"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Field label="About your institute (shown on your public website)">
        <Textarea name="description" rows={4} defaultValue={institute.description ?? ""} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City">
          <Input name="city" defaultValue={institute.city ?? ""} />
        </Field>
        <Field label="Address">
          <Input name="address" defaultValue={institute.address ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact phone">
          <Input name="contactPhone" defaultValue={institute.contactPhone} />
        </Field>
        <Field label="Logo URL">
          <Input name="logoUrl" type="url" defaultValue={institute.logoUrl ?? ""} placeholder="https://..." />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Saved.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
