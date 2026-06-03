import type { SummaryListItem } from "@/types/summary";

export type HistoryGroup = {
  label: string;
  items: SummaryListItem[];
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLabel(createdAt: Date, today: Date, yesterday: Date): string {
  const day = startOfDay(createdAt).getTime();
  if (day === today.getTime()) return "오늘";
  if (day === yesterday.getTime()) return "어제";
  return "이전";
}

export function groupSummariesByDate(items: SummaryListItem[]): HistoryGroup[] {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const map = new Map<string, SummaryListItem[]>();
  const order = ["오늘", "어제", "이전"];

  for (const item of items) {
    const label = getLabel(new Date(item.createdAt), today, yesterday);
    const list = map.get(label) ?? [];
    list.push(item);
    map.set(label, list);
  }

  const groups: HistoryGroup[] = [];
  for (const label of order) {
    const groupItems = map.get(label);
    if (groupItems?.length) {
      groups.push({ label, items: groupItems });
    }
  }

  return groups;
}
