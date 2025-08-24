import { getSupabase } from "@/lib/core/supabaseClient";

/**
 * Image handling utility functions for managing receipt images
 */

/**
 * Gets a signed URL for an image from Supabase storage
 * @param imagePath - Path to the image in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<{url: string | null, error: any}> - Signed URL or null if error
 */
export async function getImageUrl(imagePath: string, expiresIn: number = 60 * 60) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(imagePath, expiresIn);

  if (error) {
    console.warn('Failed to get signed URL for image:', imagePath, error);
    return { url: null, error };
  }

  return { url: data?.signedUrl || null, error: null };
}

/**
 * Downloads an image from Supabase storage
 * @param imagePath - Path to the image in storage
 * @returns Promise<{data: Blob | null, error: any}> - Image data or null if error
 */
export async function downloadImage(imagePath: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from("receipts").download(imagePath);

  if (error) {
    console.error("Error downloading image:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Triggers a browser download for an image blob
 * @param imageBlob - The image blob to download
 * @param fileName - Name for the downloaded file
 */
export function triggerImageDownload(imageBlob: Blob, fileName: string) {
  const url = URL.createObjectURL(imageBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename for downloaded images
 * @param imagePath - Original image path
 * @returns string - Generated filename
 */
export function generateImageFileName(imagePath: string): string {
  return imagePath.split("/").pop() || "receipt.jpg";
}

/**
 * Checks if an image path exists in the signed URLs cache
 * @param imagePath - Path to check
 * @param signedUrls - Cache of signed URLs
 * @returns boolean - True if URL exists in cache
 */
export function hasSignedUrl(imagePath: string, signedUrls: Record<string, string>): boolean {
  return Boolean(signedUrls[imagePath]);
}

/**
 * Gets a signed URL from cache or fetches a new one
 * @param imagePath - Path to the image
 * @param signedUrls - Cache of signed URLs
 * @returns Promise<{url: string | null, error: any}> - Signed URL
 */
export async function getCachedOrFetchImageUrl(
  imagePath: string,
  signedUrls: Record<string, string>
) {
  if (hasSignedUrl(imagePath, signedUrls)) {
    return { url: signedUrls[imagePath], error: null };
  }

  return await getImageUrl(imagePath);
}