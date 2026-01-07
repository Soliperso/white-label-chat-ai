import { Suspense } from 'react';
import { AnalyticsPageClient } from './analytics-page-client';

interface AnalyticsPageProps {
  params: Promise<{
    widgetId: string;
  }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { widgetId } = await params;

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    }>
      <AnalyticsPageClient widgetId={widgetId} />
    </Suspense>
  );
}
