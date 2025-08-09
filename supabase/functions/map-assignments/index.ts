// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = (await req.json().catch(() => ({}))) as any;
  const { receiptId, prompt } = body;
  if (!receiptId || !prompt) return new Response("Bad Request", { status: 400 });

  // TODO: Implement LLM mapping. For now return no-ops.
  return Response.json({ ops: [] });
};

// @ts-ignore - Deno deploy style
Deno.serve(handler);


