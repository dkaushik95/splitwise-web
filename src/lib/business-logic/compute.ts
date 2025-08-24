export type Item = { id: string; subtotal: number };
export type Assignment = {
  item_id: string;
  participant_id: string;
  share_type: "equal" | "portion" | "amount";
  portion?: number | null;
  amount?: number | null;
};

export function computeTotals(items: Item[], assignments: Assignment[], meta: { key: string; amount: number }[]) {
  const totals: Record<string, number> = {};

  const itemIdToAssignments: Record<string, Assignment[]> = {};
  for (const asg of assignments) {
    if (!itemIdToAssignments[asg.item_id]) itemIdToAssignments[asg.item_id] = [];
    itemIdToAssignments[asg.item_id].push(asg);
  }

  for (const item of items) {
    const asgs = itemIdToAssignments[item.id] || [];
    if (asgs.length === 0) continue;

    const equalAssignees = asgs.filter((a) => a.share_type === "equal").map((a) => a.participant_id);
    const portionAssignees = asgs.filter((a) => a.share_type === "portion");
    const amountAssignees = asgs.filter((a) => a.share_type === "amount");

    const explicitAmount = amountAssignees.reduce((sum, a) => sum + (a.amount || 0), 0);
    const remainingAfterAmounts = Math.max(0, item.subtotal - explicitAmount);

    const portionTotal = portionAssignees.reduce((sum, a) => sum + (a.portion || 0), 0);
    let remainingAfterPortions = remainingAfterAmounts;
    if (portionTotal > 0) {
      for (const a of portionAssignees) {
        const part = (remainingAfterAmounts * ((a.portion || 0) / portionTotal)) || 0;
        totals[a.participant_id] = (totals[a.participant_id] || 0) + part;
        remainingAfterPortions -= part;
      }
    }

    const equalCount = equalAssignees.length;
    if (equalCount > 0) {
      const each = remainingAfterPortions / equalCount;
      for (const pid of equalAssignees) {
        totals[pid] = (totals[pid] || 0) + each;
      }
      remainingAfterPortions = 0;
    }

    for (const a of amountAssignees) {
      totals[a.participant_id] = (totals[a.participant_id] || 0) + (a.amount || 0);
    }
  }

  const subtotalSum = Object.values(totals).reduce((s, v) => s + v, 0) || 0;
  const metaSum = meta.reduce((s, m) => s + (m.amount || 0), 0);
  if (subtotalSum > 0 && metaSum !== 0) {
    for (const pid of Object.keys(totals)) {
      const proportion = totals[pid] / subtotalSum;
      totals[pid] += metaSum * proportion;
    }
  }

  return totals;
}


