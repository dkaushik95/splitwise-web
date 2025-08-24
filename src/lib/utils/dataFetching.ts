import { getSupabase } from "@/lib/core/supabaseClient";

export type DashboardReceipt = {
  id: string;
  title: string | null;
  created_at: string;
  total_amount?: number;
  participant_count?: number;
  image_path?: string;
};

/**
 * Data fetching utility functions for receipts and related data
 */

/**
 * Fetches all receipts for the current user
 * @returns Promise<{receipts: DashboardReceipt[], signedUrls: Record<string, string>}> - Receipts and their signed URLs
 */
export async function fetchUserReceipts(): Promise<{ receipts: DashboardReceipt[], signedUrls: Record<string, string> }> {
  const supabase = getSupabase();

  // Fetch receipts with image paths
  const { data } = await supabase
    .from("receipts")
    .select("id,title,created_at,image_path,total")
    .order("created_at", { ascending: false });

  const receipts = (data as DashboardReceipt[]) || [];

  // Preload signed URLs for thumbnails
  const signedUrls: Record<string, string> = {};
  const paths = receipts.map((r) => r.image_path).filter(Boolean) as string[];

  if (paths.length) {
    const entries = await Promise.all(
      paths.map(async (path) => {
        const res = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 60);
        // Only include URLs for files that exist
        if (res.data?.signedUrl && !res.error) {
          return [path, res.data.signedUrl] as const;
        }
        return null;
      })
    );

    Object.assign(signedUrls, Object.fromEntries(entries.filter((entry): entry is [string, string] => entry !== null)));
  }

  return { receipts, signedUrls };
}

/**
 * Creates a new receipt after file upload
 * @param imagePath - Path to the uploaded image
 * @param userId - ID of the user creating the receipt
 * @returns Promise<{receipt: any, error: any}> - Created receipt data
 */
export async function createReceipt(imagePath: string, userId: string) {
  const supabase = getSupabase();

  const { data: receipt, error } = await supabase
    .from("receipts")
    .insert([{ owner_id: userId, image_path: imagePath, title: "New receipt" }])
    .select()
    .single();

  return { receipt, error };
}

/**
 * Triggers the edge function to extract receipt items
 * @param receiptId - ID of the receipt to process
 * @param imagePath - Path to the receipt image
 */
export async function triggerReceiptProcessing(receiptId: string, imagePath: string) {
  try {
    await fetch("/functions/v1/extract-receipt-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId, imagePath }),
    });
  } catch (error) {
    console.error("Failed to trigger receipt processing:", error);
  }
}