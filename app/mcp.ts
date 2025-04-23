import { z } from "zod";
import Replicate from "replicate";

import { initializeMcpApiHandler } from "@/lib/mcp-api-handler";

export const mcpHandler = initializeMcpApiHandler(
  (server) => {
    server.tool(
      "coloring_book_page",
      { prompt: z.string() },
      async ({ prompt }) => {
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

        return {
          content: [{ type: "text", text: `${output}` }],
        };
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
