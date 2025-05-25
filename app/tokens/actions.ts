"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { generateTokenComponents, hashTokenSecret } from "@/lib/token-utils";

type AccessToken = Database["public"]["Tables"]["access_tokens"]["Row"];

// Get all access tokens for a user
export async function getAccessTokens(userId: string): Promise<AccessToken[]> {
  const supabase = await createClient(); // Await the async client creation

  const { data, error } = await supabase
    .from("access_tokens")
    .select("id, user_id, lookup, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching access tokens:", error);
    return [];
  }

  return data as AccessToken[];
}

// Create a new access token
export async function createAccessToken(
  userId: string
): Promise<{ success: boolean; newToken?: string; error?: string }> {
  const supabase = await createClient();

  try {
    // Generate token components using shared utility
    const { token, lookup, fullToken } = generateTokenComponents();

    // Hash the token secret
    const hashedSecret = await hashTokenSecret(token);

    const { error } = await supabase.from("access_tokens").insert([
      {
        user_id: userId,
        token: hashedSecret,
        lookup: lookup,
      },
    ]);

    if (error) {
      console.error("Error creating access token:", error);
      return { success: false, error: "Could not create token." };
    }

    revalidatePath("/tokens");
    return { success: true, newToken: fullToken };
  } catch (hashError) {
    console.error("Error hashing token:", hashError);
    return { success: false, error: "Could not process token creation." };
  }
}

export async function deleteAccessToken(
  tokenId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("access_tokens")
    .delete()
    .eq("id", tokenId);

  if (error) {
    console.error("Error deleting access token:", error);
    return { success: false, error: "Could not delete token." };
  }

  revalidatePath("/tokens");
  return { success: true };
}
