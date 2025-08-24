import { createReceipt, triggerReceiptProcessing } from "./dataFetching";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getSupabase } from "@/lib/supabaseClient";

/**
 * File upload utility functions for handling receipt image uploads
 */

/**
 * Uploads a file to Supabase storage and creates a corresponding receipt
 * @param file - The file to upload
 * @param userId - ID of the user uploading the file
 * @param router - Next.js router instance for navigation
 * @returns Promise<void>
 */
export async function uploadFile(file: File, userId: string, router: AppRouterInstance) {
  try {
    const supabase = getSupabase();
    const path = `receipts/${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
    if (error) throw error;

    await handleUploaded(path, userId, router);
  } catch (err) {
    console.error("File upload error:", err);
    throw err;
  }
}

/**
 * Handles the post-upload processing for a receipt
 * @param imagePath - Path to the uploaded image
 * @param userId - ID of the user who uploaded the file
 * @param router - Next.js router instance for navigation
 */
export async function handleUploaded(imagePath: string, userId: string, router: AppRouterInstance) {
  const supabase = getSupabase();

  // Create receipt row
  const { receipt, error } = await createReceipt(imagePath, userId);

  if (error || !receipt) {
    console.error("Failed to create receipt:", error);
    return;
  }

  // Fire-and-forget edge function to extract items
  triggerReceiptProcessing(receipt.id, imagePath);

  // Navigate to edit page
  router.push(`/receipt/${receipt.id}/edit`);
}

/**
 * Generates a unique file path for receipt uploads
 * @param userId - ID of the user uploading the file
 * @param fileName - Original filename
 * @returns string - Generated file path
 */
export function generateReceiptPath(userId: string, fileName: string): string {
  return `receipts/${userId}/${Date.now()}-${fileName}`;
}

/**
 * Validates if a file is a valid image type
 * @param file - File to validate
 * @returns boolean - True if file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}