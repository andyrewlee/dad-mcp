import { SupabaseClient } from "@supabase/supabase-js";

export async function resolveStorageUrl(
  supabase: SupabaseClient,
  imageUrl: string
): Promise<string | null> {
  const path = imageUrl.split("/").slice(-2).join("/");

  try {
    const { data, error } = await supabase.storage
      .from("private")
      .createSignedUrl(path, 600);
    return error ? null : data?.signedUrl || null;
  } catch {
    return null;
  }
}
