"use client";

import { useEffect, useState } from "react";

import { getSupabase } from "@/lib/supabaseClient";

type Participant = { id: string; name: string };

export function ParticipantsPanel({ receiptId }: { receiptId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("participants")
        .select("id,name")
        .eq("receipt_id", receiptId)
        .order("name");
      setParticipants((data || []) as Participant[]);
    })();
  }, [receiptId]);

  async function add() {
    if (!name.trim()) return;
    const supabase = getSupabase();
    await supabase.from("participants").insert([{ receipt_id: receiptId, name }]);
    setName("");
    // reload list
    const { data } = await supabase
      .from("participants")
      .select("id,name")
      .eq("receipt_id", receiptId)
      .order("name");
    setParticipants((data || []) as Participant[]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add participant" />
        <button onClick={add}>Add</button>
      </div>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}


