"use client";

import { useState } from "react";
import { callMapAssignments } from "@/lib/edge";

export function PromptAssign({ receiptId }: { receiptId: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await callMapAssignments({ receiptId, prompt: text });
      setText("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Alice had salad; Bob/Carol split pizza"
        style={{ flex: 1 }}
      />
      <button onClick={submit} disabled={loading}>
        Assign
      </button>
    </div>
  );
}


