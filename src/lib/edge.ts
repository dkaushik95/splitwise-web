// Edge function client wrappers

export type ExtractItemsRequest = {
  receiptId: string;
  imagePath: string;
};

export type ExtractItemsResponse = {
  items: Array<{
    line_index: number;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
};

export async function callExtractReceiptItems(body: ExtractItemsRequest) {
  const res = await fetch("/functions/v1/extract-receipt-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("extract-receipt-items failed");
  return (await res.json()) as ExtractItemsResponse;
}

export type MapAssignmentOp = {
  item_id: string;
  participant_id: string;
  share_type: "equal" | "portion" | "amount";
  portion?: number;
  amount?: number;
};

export async function callMapAssignments(body: { receiptId: string; prompt: string }) {
  const res = await fetch("/functions/v1/map-assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("map-assignments failed");
  return (await res.json()) as { ops: MapAssignmentOp[] };
}

export async function callCreateShareLink(body: { receiptId: string; enabled: boolean }) {
  const res = await fetch("/functions/v1/create-share-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("create-share-link failed");
  return (await res.json()) as { public_view_token: string; url: string };
}


