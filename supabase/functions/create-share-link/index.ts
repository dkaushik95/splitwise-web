// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = (await req.json().catch(() => ({}))) as any;
  const { receiptId, enabled } = body;
  if (!receiptId || typeof enabled !== "boolean") return new Response("Bad Request", { status: 400 });

  // TODO: Persist token + enabled in DB. For now, return a dummy URL.
  const token = crypto.randomUUID();
  const url = `${new URL(req.url).origin}/share/${token}`;
  return Response.json({ public_view_token: token, url });
};

// @ts-ignore - Deno deploy style
Deno.serve(handler);


