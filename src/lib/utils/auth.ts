import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getSupabase } from "@/lib/supabaseClient";

/**
 * Authentication utility functions for managing user sessions and authentication state
 */

/**
 * Checks if a user is currently authenticated
 * @returns Promise<{user: any | null, error: any | null}> - User object if authenticated, null otherwise
 */
export async function checkUserAuthentication() {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Signs out the current user and redirects to login page
 * @param router - Next.js router instance for navigation
 */
export async function signOutUser(router: AppRouterInstance) {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  router.push("/login");
}

/**
 * Gets the current authenticated user
 * @returns Promise<{user: any | null, error: any | null}> - Current user data
 */
export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}