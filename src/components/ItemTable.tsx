"use client";

import { useEffect, useState } from "react";

import { getSupabase } from "@/lib/core/supabaseClient";

type Item = {
  id: string;
  receipt_id: string;
  line_index: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export function ItemTable({ receiptId }: { receiptId: string }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("receipt_items")
        .select("*")
        .eq("receipt_id", receiptId)
        .order("line_index", { ascending: true });
      if (!error && data) setItems(data as Item[]);
    })();
  }, [receiptId]);

  async function updateField(id: string, field: keyof Item, value: string | number) {
    const supabase = getSupabase();
    const { error } = await supabase.from("receipt_items").update({ [field]: value }).eq("id", id);
    if (error) console.error(error);
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td>{it.line_index}</td>
            <td>
              <input defaultValue={it.description} onBlur={(e) => updateField(it.id, "description", e.target.value)} />
            </td>
            <td>
              <input
                type="number"
                step="0.001"
                defaultValue={it.quantity}
                onBlur={(e) => updateField(it.id, "quantity", Number(e.target.value))}
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                defaultValue={it.unit_price}
                onBlur={(e) => updateField(it.id, "unit_price", Number(e.target.value))}
              />
            </td>
            <td>{it.subtotal.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


