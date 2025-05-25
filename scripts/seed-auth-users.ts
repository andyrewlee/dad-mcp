import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { hashTokenSecret } from "@/lib/token-utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOOKUP = "631d770c";
const TOKEN = "09cd64fb42a800a59bbcf9ad40b9f36d";

// Create an admin Supabase client that bypasses RLS (similar to createAdminClient in lib/supabase/admin.ts)
function createAdminSupabaseClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function main() {
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email: "andrew@founding.so",
      password: "ModelContextProtocol!",
      email_confirm: true,
    });

    if (error) throw error;

    const userId = data.user.id;
    const hashedSecret = await hashTokenSecret(TOKEN);

    const { error: tokenError } = await supabase.from("access_tokens").insert([
      {
        user_id: userId,
        token: hashedSecret,
        lookup: LOOKUP,
      },
    ]);

    if (tokenError) throw tokenError;
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
}

// Run the main function
main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
