"use client";

import { getSupabase } from "@/lib/core/supabaseClient";
import { useState } from "react";

type Props = {
  onUploaded: (path: string) => void;
};

export function UploadDropzone({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = getSupabase();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not signed in");
      const path = `receipts/${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
      if (error) throw error;
      onUploaded(path);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}


