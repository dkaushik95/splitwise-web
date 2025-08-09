"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DashboardReceipt = { id: string; title: string | null; created_at: string };

export default function Home() {
  const [receipts, setReceipts] = useState<DashboardReceipt[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("receipts")
        .select("id,title,created_at")
        .order("created_at", { ascending: false });
      setReceipts((data as DashboardReceipt[]) || []);
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Receipts</h1>
      <div style={{ margin: "12px 0" }}>
        <Link href="/receipt/new">New Receipt</Link>
      </div>
      <ul>
        {receipts.map((r) => (
          <li key={r.id}>
            <Link href={`/receipt/${r.id}/edit`}>{r.title || r.id}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
