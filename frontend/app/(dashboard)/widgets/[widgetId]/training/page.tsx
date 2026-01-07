import { Suspense } from 'react';
import { TrainingPageClient } from './training-page-client';

interface TrainingPageProps {
  params: Promise<{
    widgetId: string;
  }>;
}

export default async function TrainingPage({ params }: TrainingPageProps) {
  const { widgetId } = await params;

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    }>
      <TrainingPageClient widgetId={widgetId} />
    </Suspense>
  );
}
