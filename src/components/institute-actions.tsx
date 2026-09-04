"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

async function call(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: body === undefined ? "POST" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong");
}

export function InstituteActions({
  id,
  status,
}: {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
      setRejecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <>
            <Button disabled={busy} onClick={() => run(() => call(`/api/institutes/${id}/approve`))}>
              Approve
            </Button>
            <Button variant="danger" disabled={busy} onClick={() => setRejecting((v) => !v)}>
              Reject
            </Button>
          </>
        )}
        {status === "APPROVED" && (
          <Button variant="danger" disabled={busy} onClick={() => run(() => call(`/api/institutes/${id}/suspend`, { action: "suspend" }))}>
            Suspend
          </Button>
        )}
        {status === "SUSPENDED" && (
          <Button disabled={busy} onClick={() => run(() => call(`/api/institutes/${id}/suspend`, { action: "reactivate" }))}>
            Reactivate
          </Button>
        )}
        {status === "REJECTED" && (
          <Button disabled={busy} onClick={() => run(() => call(`/api/institutes/${id}/approve`))}>
            Approve anyway
          </Button>
        )}
      </div>

      {rejecting && (
        <div className="flex gap-2">
          <Input
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => run(() => call(`/api/institutes/${id}/reject`, { reason }))}
          >
            Confirm reject
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
