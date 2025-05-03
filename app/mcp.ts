import { z } from "zod";
import Replicate from "replicate";

import { initializeMcpApiHandler } from "@/lib/mcp-api-handler";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper function to download and upload image
async function uploadImageToSupabase(
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
    const { data, error } = await supabase.storage
      .from("private")
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
    } = supabase.storage.from("private").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

const supabase = createAdminClient();

export const mcpHandler = initializeMcpApiHandler(
  (server, userId) => {
    server.tool(
      "coloring_book_page",
      { prompt: z.string() },
      async ({ prompt }, extra) => {
        try {
          const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
          });

          const output = await replicate.run(
            "pnickolas1/sdxl-coloringbook:d2b110483fdce03119b21786d823f10bb3f5a7c49a7429da784c5017df096d33",
            {
              input: {
                width: 1024,
                height: 1024,
                prompt: `${prompt}. Simple, black and white outline. Easy to color.`,
                refine: "no_refiner",
                scheduler: "K_EULER",
                lora_scale: 0.6,
                num_outputs: 1,
                guidance_scale: 7.5,
                apply_watermark: true,
                high_noise_frac: 0.8,
                negative_prompt: "complex, realistic, color, gradient, shading",
                prompt_strength: 0.8,
                num_inference_steps: 50,
              },
            }
          );

          // The output is an array with the image URL
          const imageUrl = `${output}`;

          // First create the output record with empty image URL
          const { data: outputData, error: createError } = await supabase
            .from("outputs")
            .insert({
              user_id: userId,
              source: "coloring_book_page",
              is_public: false,
              data: { prompt },
            })
            .select()
            .single();

          if (createError || !outputData) {
            throw new Error(
              `Error creating output record: ${createError?.message || "No data returned"}`
            );
          }

          // Use the output ID to name the file
          const outputId = outputData.id;

          // Upload image to Supabase
          const uploadedImageUrl = await uploadImageToSupabase(
            imageUrl,
            userId,
            outputId
          );

          // Update the output record with the image URL
          const { error: updateError } = await supabase
            .from("outputs")
            .update({
              data: { prompt, image: uploadedImageUrl },
            })
            .eq("id", outputId);

          if (updateError) {
            throw new Error(
              `Error updating output record: ${updateError.message}`
            );
          }

          return {
            content: [
              {
                type: "text",
                text: `Generated coloring page from prompt: "${prompt}". Image saved to your account.`,
              },
              { type: "text", text: uploadedImageUrl },
            ],
          };
        } catch (error) {
          console.error("Error in coloring_book_page:", error);
          return {
            content: [
              {
                type: "text",
                text: `There was an error generating your coloring book page: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        coloring_book_page: {
          description: "Generate a coloring book image from a prompt",
        },
      },
    },
  }
);
