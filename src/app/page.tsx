"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { getSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type DashboardReceipt = { id: string; title: string | null; created_at: string };

export default function Home() {
  const [receipts, setReceipts] = useState<DashboardReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // User is not authenticated, redirect to login
        router.push('/login');
        return;
      }

      // User is authenticated, fetch receipts
      const { data } = await supabase
        .from("receipts")
        .select("id,title,created_at")
        .order("created_at", { ascending: false });
      setReceipts((data as DashboardReceipt[]) || []);
      setLoading(false);
    })();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Receipts</h1>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Sign Out
        </button>
      </div>
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
