"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { notifyCreditsUpdated } from "@/components/auth/credits-badge";
import { InsufficientCreditsDialog } from "@/components/payment/insufficient-credits-dialog";
import { HistorySidebar } from "@/components/summary/history-sidebar";
import { InputPanel } from "@/components/summary/input-panel";
import { SummaryCard } from "@/components/summary/summary-card";
import { useSummaryPoll } from "@/hooks/use-summary-poll";
import { MOCK_DETAILS, MOCK_HISTORY } from "@/lib/mock/history";
import type {
  SummaryDetail,
  SummaryListItem,
  SourceType,
  SummaryOptions,
} from "@/types/summary";

type DashboardClientProps = {
  initialSummaryId?: string;
};

export function DashboardClient({ initialSummaryId }: DashboardClientProps) {
  const [history, setHistory] = useState<SummaryListItem[]>(MOCK_HISTORY);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_HISTORY[0]?.id ?? null);
  const [selectedDetail, setSelectedDetail] = useState<SummaryDetail | null>(
    MOCK_HISTORY[0] ? MOCK_DETAILS[MOCK_HISTORY[0].id] ?? null : null,
  );
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [useApi, setUseApi] = useState(true);
  const [insufficientCreditsOpen, setInsufficientCreditsOpen] = useState(false);

  const { detail: polledDetail, error: pollError, isPolling } =
    useSummaryPoll(activePollId);
  const lastPolledStatus = useRef<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/summary");
      if (!res.ok) {
        setUseApi(false);
        toast.error(
          "API에 연결되지 않아 Mock 모드입니다. 크레딧·요약은 DB에 반영되지 않습니다.",
        );
        return;
      }
      const data = (await res.json()) as { items: SummaryListItem[] };
      setUseApi(true);
      if (data.items.length > 0) {
        setHistory(data.items);
      }
    } catch {
      setUseApi(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!polledDetail) return;
    setSelectedDetail(polledDetail);

    if (
      polledDetail.status === "completed" &&
      lastPolledStatus.current !== "completed"
    ) {
      toast.success("요약이 완료되었습니다.");
      notifyCreditsUpdated();
      void loadHistory();
      setActivePollId(null);
      setIsSubmitting(false);
    }
    if (
      polledDetail.status === "failed" &&
      lastPolledStatus.current !== "failed"
    ) {
      toast.error(polledDetail.errorMessage ?? "요약에 실패했습니다.");
      setActivePollId(null);
      setIsSubmitting(false);
    }
    lastPolledStatus.current = polledDetail.status;
  }, [polledDetail, loadHistory]);

  useEffect(() => {
    if (pollError) {
      toast.error(pollError);
      setIsSubmitting(false);
      setActivePollId(null);
    }
  }, [pollError]);

  const loadDetail = useCallback(
    async (id: string) => {
      if (id.startsWith("mock-")) {
        setSelectedDetail(MOCK_DETAILS[id] ?? null);
        return;
      }

      try {
        const res = await fetch(`/api/summary/${id}`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as SummaryDetail;
        setSelectedDetail(data);
        if (data.status === "pending") {
          setActivePollId(id);
          setIsSubmitting(true);
        }
      } catch {
        toast.error("요약을 불러오지 못했습니다.");
      }
    },
    [],
  );

  useEffect(() => {
    if (!initialSummaryId || !useApi) return;
    setSelectedId(initialSummaryId);
    void loadDetail(initialSummaryId);
  }, [initialSummaryId, useApi, loadDetail]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileSidebarOpen(false);
    void loadDetail(id);
  };

  const handleSubmit = async (
    sourceType: SourceType,
    content: string,
    options: SummaryOptions,
  ) => {
    if (!useApi) {
      toast.message("API 연결 없음 — Mock 모드로 표시합니다.");
      await new Promise((r) => setTimeout(r, 1200));
      const mock = MOCK_HISTORY[0];
      if (mock) {
        setSelectedId(mock.id);
        setSelectedDetail(MOCK_DETAILS[mock.id] ?? null);
      }
      return;
    }

    setIsSubmitting(true);
    setSelectedDetail(null);

    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType, content, options }),
    });

    const data = (await res.json()) as {
      summaryId?: string;
      error?: string;
      code?: string;
    };

    if (res.status === 402 && data.code === "INSUFFICIENT_CREDITS") {
      setIsSubmitting(false);
      setInsufficientCreditsOpen(true);
      return;
    }

    if (!res.ok) {
      setIsSubmitting(false);
      throw new Error(data.error ?? "요약 요청에 실패했습니다.");
    }

    if (!data.summaryId) {
      setIsSubmitting(false);
      throw new Error("요약 ID를 받지 못했습니다.");
    }

    toast.message(
      "요약이 시작되었습니다. 완료되면 이메일로 알려 드립니다.",
    );
    notifyCreditsUpdated();
    setSelectedId(data.summaryId);
    setActivePollId(data.summaryId);

    const pendingItem: SummaryListItem = {
      id: data.summaryId,
      title: "요약 처리 중...",
      sourceType,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [pendingItem, ...prev.filter((i) => i.id !== data.summaryId)]);
    void loadHistory();
  };

  const showLoading =
    isSubmitting ||
    isPolling ||
    selectedDetail?.status === "pending" ||
    (activePollId !== null && !selectedDetail);

  return (
    <div className="flex min-h-screen bg-background">
      <InsufficientCreditsDialog
        open={insufficientCreditsOpen}
        onClose={() => setInsufficientCreditsOpen(false)}
      />
      <HistorySidebar
        items={history}
        selectedId={selectedId}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onSelect={handleSelect}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onToggleMobile={() => setMobileSidebarOpen((o) => !o)}
      />

      <main className="flex min-h-screen flex-1 flex-col">
        <div className="border-b px-4 py-3 pl-14 md:pl-4">
          <h1 className="text-lg font-semibold">대시보드</h1>
          <p className="text-sm text-muted-foreground">
            텍스트 또는 YouTube URL로 AI 요약을 시작하세요.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8">
          <div className="flex justify-center">
            <InputPanel
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              disabled={showLoading && isSubmitting}
            />
          </div>

          <SummaryCard
            detail={selectedDetail}
            isLoading={showLoading}
            loadingMessage="요약 중입니다. 잠시만 기다려 주세요..."
          />
        </div>
      </main>
    </div>
  );
}
