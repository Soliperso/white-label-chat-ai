'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWidget } from '@/hooks/use-widgets';
import { WidgetNav } from '@/components/widgets/widget-nav';
import { WidgetAnalytics } from '@/components/widgets/widget-analytics';

interface AnalyticsPageClientProps {
  widgetId: string;
}

export function AnalyticsPageClient({ widgetId }: AnalyticsPageClientProps) {
  const router = useRouter();
  const { data: widget, isLoading } = useWidget(widgetId);

  const handleBack = () => {
    router.push(`/widgets/${widgetId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!widget) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Widget not found</h2>
          <p className="text-muted-foreground mt-2">
            The widget you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/widgets')} className="mt-4">
            Back to Widgets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{widget.name}</h1>
          <p className="text-muted-foreground mt-1">
            Monitor performance and user interactions
          </p>
        </div>
      </div>

      {/* Widget Navigation */}
      <WidgetNav widgetId={widgetId} />

      {/* Analytics Component */}
      <WidgetAnalytics widgetId={widgetId} />
    </div>
  );
}
