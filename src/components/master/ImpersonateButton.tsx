"use client";

import { useState } from "react";
import { impersonateNursery } from "@/lib/actions/impersonation";
import { Button } from "@/components/ui/Button";

export function ImpersonateButton({ nurseryId }: { nurseryId: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const url = await impersonateNursery(nurseryId);
          window.location.href = url;
        } catch (e) {
          setLoading(false);
          alert(e instanceof Error ? e.message : "Failed to log in as admin.");
        }
      }}
    >
      {loading ? "Logging in…" : "Log in as admin"}
    </Button>
  );
}
