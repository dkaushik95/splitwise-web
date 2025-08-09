"use client";

import { getSupabase } from "@/lib/supabaseClient";

export function AuthButton() {
  const signIn = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };
  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={signIn}>Sign in with Google</button>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}


