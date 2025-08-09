"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { computeTotals } from "@/lib/compute";

export function SummaryCard({ receiptId }: { receiptId: string }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [meta, setMeta] = useState<any[]>([]);

  async function loadAll() {
    const [a, i, p, m] = await Promise.all([
      supabase.from("assignments").select("*"),
      supabase.from("receipt_items").select("*").eq("receipt_id", receiptId),
      supabase.from("participants").select("*").eq("receipt_id", receiptId),
      supabase.from("receipt_meta").select("*").eq("receipt_id", receiptId),
    ]);
    setAssignments(a.data || []);
    setItems(i.data || []);
    setParticipants(p.data || []);
    setMeta(m.data || []);
  }

  useEffect(() => {
    loadAll();
  }, [receiptId]);

  const totals = computeTotals(
    items.map((it) => ({ id: it.id, subtotal: it.subtotal })),
    assignments,
    meta.map((x) => ({ key: x.key, amount: x.amount })),
  );

  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h3>Split Summary</h3>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.name}: {(totals[p.id] || 0).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}


