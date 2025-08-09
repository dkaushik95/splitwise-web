"use client";

import { UploadDropzone } from "@/components/UploadDropzone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewReceiptPage() {
  const router = useRouter();

  async function handleUploaded(imagePath: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      router.push("/login");
      return;
    }
    // Create receipt row
    const { data: receipt, error } = await supabase
      .from("receipts")
      .insert([{ owner_id: user.id, image_path: imagePath, title: "New receipt" }])
      .select()
      .single();
    if (error || !receipt) return;

    // Call edge function to extract items
    fetch("/functions/v1/extract-receipt-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId: receipt.id, imagePath }),
    }).catch(console.error);

    router.push(`/receipt/${receipt.id}/edit`);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Upload receipt image</h1>
      <UploadDropzone onUploaded={handleUploaded} />
    </main>
  );
}


