"use client";

import { useState } from "react";
import { callCreateShareLink } from "@/lib/edge";

export function ShareToggle({ receiptId }: { receiptId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  async function toggle() {
    const res = await callCreateShareLink({ receiptId, enabled: !enabled });
    setEnabled(!enabled);
    setUrl(res.url);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={toggle}>{enabled ? "Disable Share" : "Enable Share"}</button>
      {url && <a href={url} target="_blank" rel="noreferrer">Open share link</a>}
    </div>
  );
}


