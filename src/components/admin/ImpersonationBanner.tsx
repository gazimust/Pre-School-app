"use client";

import { useState } from "react";
import { stopImpersonating } from "@/lib/actions/impersonation";

export function ImpersonationBanner({ nurseryName }: { nurseryName: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm text-white">
      <span>
        You&rsquo;re viewing <strong>{nurseryName}</strong> as a platform admin support session.
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const url = await stopImpersonating();
          window.location.href = url;
        }}
        className="rounded-md bg-white/20 px-3 py-1 font-medium hover:bg-white/30"
      >
        {loading ? "Returning…" : "Return to platform admin"}
      </button>
    </div>
  );
}
