"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Participant = { id: string; name: string };

export function ParticipantsPanel({ receiptId }: { receiptId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.from("participants").select("id,name").eq("receipt_id", receiptId).order("name");
    setParticipants((data || []) as Participant[]);
  }
  useEffect(() => {
    load();
  }, [receiptId]);

  async function add() {
    if (!name.trim()) return;
    await supabase.from("participants").insert([{ receipt_id: receiptId, name }]);
    setName("");
    load();
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


