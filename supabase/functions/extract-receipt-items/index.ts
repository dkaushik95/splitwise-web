// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = (await req.json().catch(() => ({}))) as any;
  const { receiptId, imagePath } = body;
  if (!receiptId || !imagePath) return new Response("Bad Request", { status: 400 });

  // TODO: Implement OCR/LLM. For now, return a stub item.
  const items = [
    { line_index: 1, description: "Sample item", quantity: 1, unit_price: 9.99 },
  ];

  return Response.json({ items });
};

// @ts-ignore - Deno deploy style
Deno.serve(handler);


