import { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "./admin";

export async function resolveStorageUrl(
  supabase: SupabaseClient,
  imageUrl: string
): Promise<string | null> {
  const path = imageUrl.split("/").slice(-2).join("/");

  try {
    const { data, error } = await supabase.storage
      .from("private-assets")
      .createSignedUrl(path, 600);
    return error ? null : data?.signedUrl || null;
  } catch {
    return null;
  }
}

export async function uploadImageToSupabase(
  imageUrl: string,
  userId: string,
  outputId: string
) {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBlob = await response.blob();

    // Create file name using the output ID
    const fileName = `${userId}/${outputId}.png`;

    // Get supabase client
    const supabase = createAdminClient();

    // Upload to Supabase
    const { error } = await supabase.storage
      .from("private-assets")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading image to Supabase: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("private-assets").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
