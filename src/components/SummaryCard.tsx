"use client";

import { useEffect, useState } from "react";

import { computeTotals } from "@/lib/business-logic/compute";
import { getSupabase } from "@/lib/core/supabaseClient";

export function SummaryCard({ receiptId }: { receiptId: string }) {
  type Assignment = {
    id: string;
    item_id: string;
    participant_id: string;
    share_type: "equal" | "portion" | "amount";
    portion: number | null;
    amount: number | null;
  };
  type Item = { id: string; receipt_id: string; subtotal: number };
  type Participant = { id: string; name: string };
  type Meta = { id: string; key: string; amount: number };

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meta, setMeta] = useState<Meta[]>([]);


  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const [a, i, p, m] = await Promise.all([
        supabase.from("assignments").select("*"),
        supabase.from("receipt_items").select("*").eq("receipt_id", receiptId),
        supabase.from("participants").select("*").eq("receipt_id", receiptId),
        supabase.from("receipt_meta").select("*").eq("receipt_id", receiptId),
      ]);
      setAssignments((a.data as Assignment[]) || []);
      setItems((i.data as Item[]) || []);
      setParticipants((p.data as Participant[]) || []);
      setMeta((m.data as Meta[]) || []);
    })();
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


