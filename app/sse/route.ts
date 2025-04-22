import { createServerResponseAdapter } from "@/lib/server-response-adapter";
import { mcpHandler } from "@/app/mcp";
import { validateToken } from "@/lib/validate-token";

export const maxDuration = 60;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const isValid = await validateToken(token);

  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  return createServerResponseAdapter(req.signal, async (res) => {
    mcpHandler(req, res);
  });
}
