import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  TOKEN_PREFIX,
  LOOKUP_PREFIX_LENGTH,
  LOOKUP_SUFFIX_LENGTH,
  TOKEN_LENGTH,
} from "./validate-token";

// Function to generate a secure random token
function generateSecureToken(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// Generate token components - can be used by both app and scripts
export function generateTokenComponents() {
  const lookupPrefix = generateSecureToken(LOOKUP_PREFIX_LENGTH);
  const lookupSuffix = generateSecureToken(LOOKUP_SUFFIX_LENGTH);
  const token = generateSecureToken(TOKEN_LENGTH);
  const lookup = lookupPrefix + lookupSuffix;
  const fullToken = `${TOKEN_PREFIX}${lookupPrefix}${token}${lookupSuffix}`;

  return {
    lookupPrefix,
    lookupSuffix,
    token,
    lookup,
    fullToken,
  };
}

// Hash the token secret
export async function hashTokenSecret(token: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(token, saltRounds);
}
