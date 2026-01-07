'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetNav } from '@/components/widgets/widget-nav';
import { useWidget } from '@/hooks/use-widgets';

export default function WidgetChatsPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.widgetId as string;

  const { data: widget, isLoading } = useWidget(widgetId);

  const handleBack = () => {
    router.push('/widgets');
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
            View and manage chat conversations
          </p>
        </div>
      </div>

      {/* Widget Navigation */}
      <WidgetNav widgetId={widgetId} />

      {/* Empty State */}
      <div className="border rounded-lg bg-card p-12 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
        <p className="text-muted-foreground mb-6">
          Conversations from this widget will appear here once users start chatting.
        </p>
        <p className="text-sm text-muted-foreground">
          Widget ID: <code className="bg-muted px-2 py-1 rounded font-mono text-xs">{widgetId}</code>
        </p>
      </div>
    </div>
  );
}
