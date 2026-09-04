"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";

type Notice = { id: string; title: string; content: string; createdAt: string; authorId: string; authorName: string };

export function NoticeBoard({
  notices,
  currentUserId,
  canPost,
  canDeleteAny,
}: {
  notices: Notice[];
  currentUserId: string;
  canPost: boolean;
  canDeleteAny: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.get("title"), content: form.get("content") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    await fetch(`/api/notices/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canPost && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Post a notice</h2>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Title">
              <Input name="title" required maxLength={150} />
            </Field>
            <Field label="Content">
              <Textarea name="content" required rows={4} />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post notice"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {notices.length === 0 && <p className="text-sm text-slate-500">No notices yet.</p>}
        {notices.map((n) => (
          <Card key={n.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900">{n.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{n.content}</p>
                <p className="mt-2 text-xs text-slate-400">
                  — {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {(canDeleteAny || n.authorId === currentUserId) && (
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => onDelete(n.id)}>
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
