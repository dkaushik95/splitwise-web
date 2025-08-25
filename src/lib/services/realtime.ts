import { getSupabase } from "@/lib/core/supabaseClient";

export function subscribeToReceipt(receiptId: string, onChange: () => void) {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`receipt-${receiptId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "receipt_items", filter: `receipt_id=eq.${receiptId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "participants", filter: `receipt_id=eq.${receiptId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "assignments" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "receipt_meta", filter: `receipt_id=eq.${receiptId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


