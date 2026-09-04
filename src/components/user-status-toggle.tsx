"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function UserStatusToggle({ userId, status }: { userId: string; status: "ACTIVE" | "SUSPENDED" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant={status === "ACTIVE" ? "danger" : "primary"} disabled={busy} onClick={toggle} className="px-3 py-1 text-xs">
      {status === "ACTIVE" ? "Suspend" : "Reactivate"}
    </Button>
  );
}
