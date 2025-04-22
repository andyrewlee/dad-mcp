"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Database } from "@/lib/database.types";
import {
  TOKEN_PREFIX,
  LOOKUP_PREFIX_LENGTH,
  LOOKUP_SUFFIX_LENGTH,
  TOKEN_LENGTH,
} from "@/lib/validate-token";

type AccessToken = Database["public"]["Tables"]["access_tokens"]["Row"];

// Function to generate a secure random token
function generateSecureToken(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

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

  // Generate token parts with exact lengths
  const lookupPrefix = generateSecureToken(LOOKUP_PREFIX_LENGTH);
  const lookupSuffix = generateSecureToken(LOOKUP_SUFFIX_LENGTH);
  const token = generateSecureToken(TOKEN_LENGTH);

  // The full lookup is the combination of first and last parts
  const lookup = lookupPrefix + lookupSuffix;

  // Combine for the full token (prefix + firstFour + secret + lastFour)
  // User will see full token once on the client and will later see it like the following:
  // dmp_1234********************************5678
  const fullToken = `${TOKEN_PREFIX}${lookupPrefix}${token}${lookupSuffix}`;
  const saltRounds = 10;

  try {
    const hashedSecret = await bcrypt.hash(token, saltRounds);

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
