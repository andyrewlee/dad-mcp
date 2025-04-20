"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Database } from "@/lib/database.types";

type AccessToken = Database["public"]["Tables"]["access_tokens"]["Row"];

// Function to generate a secure random token
function generateSecureToken(length = 40): string {
  return crypto.randomBytes(length).toString("hex");
}

// Get all access tokens for a user
export async function getAccessTokens(userId: string): Promise<AccessToken[]> {
  const supabase = await createClient(); // Await the async client creation

  const { data, error } = await supabase
    .from("access_tokens")
    .select("id, created_at, user_id") // Only select non-sensitive data
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching access tokens:", error);
    return [];
  }
  // We explicitly cast here because we are selecting a subset of columns
  return data as AccessToken[];
}

// Create a new access token
export async function createAccessToken(
  userId: string
): Promise<{ success: boolean; newToken?: string; error?: string }> {
  const supabase = await createClient();

  const rawToken = `dmp_${generateSecureToken()}`;
  const saltRounds = 10; // Recommended salt rounds for bcrypt

  try {
    const hashedToken = await bcrypt.hash(rawToken, saltRounds);

    const { error } = await supabase
      .from("access_tokens")
      .insert([{ user_id: userId, token: hashedToken }]);

    if (error) {
      console.error("Error creating access token:", error);
      return { success: false, error: "Could not create token." };
    }

    revalidatePath("/tokens");
    return { success: true, newToken: rawToken };
  } catch (hashError) {
    console.error("Error hashing token:", hashError);
    return { success: false, error: "Could not process token creation." };
  }
}

// Delete an access token
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
