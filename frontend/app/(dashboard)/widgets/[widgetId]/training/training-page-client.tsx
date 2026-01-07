'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWidget } from '@/hooks/use-widgets';
import { WidgetNav } from '@/components/widgets/widget-nav';
import { AddTrainingSourceForm } from '@/components/widgets/add-training-source-form';
import { TrainingSourcesTable } from '@/components/widgets/training-sources-table';
import { TrainingStatusIndicator } from '@/components/widgets/training-status-indicator';
import { ChatPreviewModal } from '@/components/widgets/chat-preview-modal';

interface TrainingPageClientProps {
  widgetId: string;
}

export function TrainingPageClient({ widgetId }: TrainingPageClientProps) {
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
            Add data sources to train your AI assistant
          </p>
        </div>
      </div>

      {/* Widget Navigation */}
      <WidgetNav widgetId={widgetId} />

      {/* Training Status Banner */}
      <TrainingStatusIndicator widgetId={widgetId} />

      {/* Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="preview">Preview Chat</TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Source Form */}
            <Card className="p-6 h-fit">
              <AddTrainingSourceForm widgetId={widgetId} />
            </Card>

            {/* Sources Table */}
            <div className="lg:col-span-2">
              <TrainingSourcesTable widgetId={widgetId} />
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card className="p-6 max-w-3xl mx-auto">
            <ChatPreviewModal widgetId={widgetId} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
