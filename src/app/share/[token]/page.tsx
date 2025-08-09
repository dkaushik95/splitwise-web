"use client";

import { useEffect, useState } from "react";

import { SummaryCard } from "@/components/SummaryCard";
import { getSupabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function ShareViewPage() {
  const params = useParams<{ token: string }>();
  const token = params.token as string;
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("receipts")
        .select("id")
        .eq("public_view_enabled", true)
        .limit(1);
      setReceiptId(data?.[0]?.id || null);
    })();
  }, [token]);

  if (!receiptId) return <main style={{ padding: 24 }}>Shared view not available.</main>;
  return (
    <main style={{ padding: 24 }}>
      <h1>Shared View</h1>
      <SummaryCard receiptId={receiptId} />
    </main>
  );
}


