"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SummaryDetail } from "@/types/summary";

const POLL_INTERVAL_MS = 4000;

export function useSummaryPoll(summaryId: string | null) {
  const [detail, setDetail] = useState<SummaryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const fetchOnce = useCallback(async (id: string) => {
    const res = await fetch(`/api/summary/${id}`);
    const data = (await res.json()) as SummaryDetail & { error?: string };

    if (!res.ok) {
      throw new Error(data.error ?? "요약을 불러오지 못했습니다.");
    }

    setDetail(data);

    if (data.status === "completed" || data.status === "failed") {
      stopPolling();
    }

    return data;
  }, [stopPolling]);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      setError(null);
      setIsPolling(true);

      void fetchOnce(id).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        stopPolling();
      });

      intervalRef.current = setInterval(() => {
        void fetchOnce(id).catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : "오류가 발생했습니다.",
          );
          stopPolling();
        });
      }, POLL_INTERVAL_MS);
    },
    [fetchOnce, stopPolling],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (!summaryId) return;
    startPolling(summaryId);
  }, [summaryId, startPolling]);

  return { detail, error, isPolling, stopPolling, refresh: fetchOnce };
}
