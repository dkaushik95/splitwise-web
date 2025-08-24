import { getSupabase } from "./supabaseClient";

export type Receipt = {
  id: string;
  owner_id: string;
  title: string | null;
  vendor: string | null;
  purchased_at: string | null;
  currency: string | null;
  image_path: string | null;
  total: number | null;
  public_view_token: string | null;
  public_view_enabled: boolean | null;
  created_at: string;
  updated_at: string;
};

export async function createReceipt(ownerId: string, partial?: Partial<Receipt>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("receipts")
    .insert([{ owner_id: ownerId, ...partial }])
    .select()
    .single();
  if (error) throw error;
  return data as Receipt;
}

export async function listReceipts() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("receipts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Receipt[];
}


