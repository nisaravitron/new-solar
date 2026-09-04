"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@/components/ui";
import { ROLE_LABELS, STAFF_CREATABLE_ROLES } from "@/lib/constants";

type StudentOption = { id: string; name: string; rollNumber: string | null; className: string | null };

export function CreateUserForm({ students }: { students: StudentOption[] }) {
  const router = useRouter();
  const [role, setRole] = useState<(typeof STAFF_CREATABLE_ROLES)[number]>("STUDENT");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role,
          rollNumber: form.get("rollNumber") || undefined,
          className: form.get("className") || undefined,
          studentProfileIds: role === "PARENT" ? selectedStudents : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      (e.target as HTMLFormElement).reset();
      setSelectedStudents([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {STAFF_CREATABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Full name">
          <Input name="name" required maxLength={100} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (used to log in)">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Temporary password">
          <Input name="password" type="password" required minLength={8} />
        </Field>
      </div>

      {role === "STUDENT" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roll number">
            <Input name="rollNumber" />
          </Field>
          <Field label="Class / batch">
            <Input name="className" />
          </Field>
        </div>
      )}

      {role === "PARENT" && (
        <Field label="Link to student(s)">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">Add students first, then link a parent to them.</p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s.id)}
                    onChange={(e) =>
                      setSelectedStudents((prev) =>
                        e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                      )
                    }
                  />
                  {s.name} {s.rollNumber ? `(${s.rollNumber})` : ""} {s.className ? `· ${s.className}` : ""}
                </label>
              ))}
            </div>
          )}
        </Field>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : `Add ${ROLE_LABELS[role].toLowerCase()}`}
      </Button>
    </form>
  );
}
