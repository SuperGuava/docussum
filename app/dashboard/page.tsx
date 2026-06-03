import { DashboardClient } from "./dashboard-client";

type DashboardPageProps = {
  searchParams: Promise<{ summary?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { summary: initialSummaryId } = await searchParams;
  return (
    <DashboardClient
      initialSummaryId={
        typeof initialSummaryId === "string" && initialSummaryId.length > 0
          ? initialSummaryId
          : undefined
      }
    />
  );
}
