"use client";

import { useParams } from "next/navigation";
import { ItemTable } from "@/components/ItemTable";
import { ParticipantsPanel } from "@/components/ParticipantsPanel";
import { PromptAssign } from "@/components/PromptAssign";
import { SummaryCard } from "@/components/SummaryCard";
import { ShareToggle } from "@/components/ShareToggle";

export default function EditReceiptPage() {
  const params = useParams<{ id: string }>();
  const receiptId = params.id as string;

  return (
    <main style={{ padding: 24, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <section>
        <h2>Items</h2>
        <ItemTable receiptId={receiptId} />
      </section>
      <aside>
        <h2>Participants</h2>
        <ParticipantsPanel receiptId={receiptId} />
        <h2>Assign via Prompt</h2>
        <PromptAssign receiptId={receiptId} />
        <h2>Share</h2>
        <ShareToggle receiptId={receiptId} />
        <SummaryCard receiptId={receiptId} />
      </aside>
    </main>
  );
}


