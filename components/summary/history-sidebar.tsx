"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  PanelLeft,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { groupSummariesByDate } from "@/lib/history/group-by-date";
import { cn } from "@/lib/utils";
import type { SummaryListItem } from "@/types/summary";

type HistorySidebarProps = {
  items: SummaryListItem[];
  selectedId: string | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onSelect: (id: string) => void;
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
};

function SourceIcon({ type }: { type: SummaryListItem["sourceType"] }) {
  if (type === "youtube") {
    return <Youtube className="size-3.5 shrink-0 text-red-500" />;
  }
  return <FileText className="size-3.5 shrink-0 text-muted-foreground" />;
}

function SidebarContent({
  items,
  selectedId,
  collapsed,
  onSelect,
}: Pick<
  HistorySidebarProps,
  "items" | "selectedId" | "collapsed" | "onSelect"
>) {
  const groups = groupSummariesByDate(items);

  if (collapsed) {
    return (
      <div className="flex flex-1 flex-col items-center gap-2 py-4">
        {items.slice(0, 8).map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.title ?? "제목 없음"}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors",
              selectedId === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/60",
            )}
          >
            <SourceIcon type={item.sourceType} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3">
      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    selectedId === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60",
                  )}
                >
                  <SourceIcon type={item.sourceType} />
                  <span className="line-clamp-1 flex-1">
                    {item.title ?? "제목 없음"}
                    {item.status === "pending" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        · 처리 중
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {items.length === 0 && (
        <p className="px-2 text-sm text-muted-foreground">
          아직 요약 기록이 없습니다.
        </p>
      )}
    </div>
  );
}

export function HistorySidebar(props: HistorySidebarProps) {
  const {
    items,
    selectedId,
    collapsed,
    mobileOpen,
    onSelect,
    onToggleCollapse,
    onToggleMobile,
  } = props;

  const sidebarInner = (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-2",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <span className="px-2 text-sm font-semibold tracking-tight">
            DocuSumm
          </span>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={onToggleMobile}
            aria-label="메뉴 닫기"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <PanelLeft className="size-4" />
            )}
          </Button>
        </div>
      </div>
      <SidebarContent
        items={items}
        selectedId={selectedId}
        collapsed={collapsed}
        onSelect={onSelect}
      />
    </>
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-3 top-3 z-40 md:hidden"
        onClick={onToggleMobile}
        aria-label="히스토리 열기"
      >
        <Menu className="size-4" />
      </Button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="오버레이 닫기"
          onClick={onToggleMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:static md:z-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-14" : "md:w-72",
        )}
      >
        {sidebarInner}
      </aside>

      <Separator orientation="vertical" className="hidden md:block" />
    </>
  );
}
