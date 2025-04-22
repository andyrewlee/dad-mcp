import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcrypt";

// Configuration for token structure - must match values in actions.ts
export const TOKEN_PREFIX = "dmp_";
export const LOOKUP_LENGTH = 8; // Total ID length (4 at beginning + 4 at end)
export const LOOKUP_PREFIX_LENGTH = LOOKUP_LENGTH / 2;
export const LOOKUP_SUFFIX_LENGTH = LOOKUP_LENGTH / 2;
export const TOKEN_LENGTH = 32;

/**
 * Processes a token by extracting its components
 * @param token The token with prefix to process
 * @returns The lookup ID and token value, or false if invalid
 */
export function processToken(
  token: string | null
): { lookup: string; tokenValue: string } | false {
  // Check if token is provided
  if (!token) {
    console.warn("No token provided");
    return false;
  }

  // Check if token has the expected format (starts with prefix)
  if (!token.startsWith(TOKEN_PREFIX)) {
    console.error("Token format invalid");
    return false;
  }

  // Extract just the part after the prefix
  const tokenValue = token.substring(TOKEN_PREFIX.length);

  // Check if token has the expected length
  const expectedLength = LOOKUP_LENGTH + TOKEN_LENGTH;
  if (tokenValue.length !== expectedLength) {
    console.error("Token length invalid");
    return false;
  }

  // Extract the first 4 characters and last 4 characters for the token ID
  const firstFour = tokenValue.substring(0, 4);
  const lastFour = tokenValue.substring(tokenValue.length - 4);
  const lookup = firstFour + lastFour;

  return { lookup, tokenValue };
}

/**
 * Validates an access token against the database
 * @param token The token to validate
 * @returns A promise that resolves to true if token is valid, false otherwise
 */
export async function validateToken(token: string | null): Promise<boolean> {
  // Process the token
  const processed = processToken(token);
  if (!processed) {
    return false;
  }

  const { lookup, tokenValue } = processed;

  // The secret is everything in between
  const secretPart = tokenValue.substring(4, tokenValue.length - 4);

  // Use the admin client to bypass RLS for token validation
  const supabase = createAdminClient();

  // Query using the extracted tokenId in the prefix field
  const { data: tokens, error } = await supabase
    .from("access_tokens")
    .select("token")
    .eq("lookup", lookup);

  if (error) {
    console.error("Error fetching token:", error);
    return false;
  }

  // Verify if the token's secret part matches the stored hash
  if (tokens && tokens.length > 0) {
    const storedToken = tokens[0];
    if (
      storedToken.token &&
      (await bcrypt.compare(secretPart, storedToken.token))
    ) {
      console.log("Token validated successfully");
      return true;
    }
  }

  console.error("Invalid token provided");
  return false;
}
