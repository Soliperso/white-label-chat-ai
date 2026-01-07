'use client';

import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTrainingStatus, useTriggerTraining } from '@/hooks/use-training';

interface TrainingStatusIndicatorProps {
  widgetId: string;
}

export function TrainingStatusIndicator({ widgetId }: TrainingStatusIndicatorProps) {
  const { data: job } = useTrainingStatus(widgetId);
  const triggerMutation = useTriggerTraining();

  const handleTrain = async () => {
    try {
      await triggerMutation.mutateAsync(widgetId);
      toast.success('Training started successfully!');
    } catch (error) {
      toast.error('Failed to start training');
      console.error('Error triggering training:', error);
    }
  };

  const isTraining = job?.status === 'queued' || job?.status === 'processing';
  const isCompleted = job?.status === 'completed';
  const isFailed = job?.status === 'failed';

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Training Status</h3>
          </div>

          {!job && (
            <p className="text-sm text-muted-foreground">
              No training has been run yet. Add training sources and click the button to start.
            </p>
          )}

          {job && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isTraining && (
                  <Badge className="bg-white text-blue-800 border-blue-300 hover:bg-white">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Training in Progress
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-white text-green-800 border-green-300 hover:bg-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Training Completed
                  </Badge>
                )}
                {isFailed && (
                  <Badge className="bg-white text-red-800 border-red-300 hover:bg-white">
                    <XCircle className="h-3 w-3 mr-1" />
                    Training Failed
                  </Badge>
                )}
              </div>

              {isTraining && (
                <>
                  <Progress value={job.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Processing: {job.processedItems} / {job.totalItems} items (
                    {job.progress}%)
                  </p>
                </>
              )}

              {isCompleted && (
                <p className="text-sm text-muted-foreground">
                  Successfully processed {job.totalItems} items. Your AI is ready to use!
                </p>
              )}

              {isFailed && job.errorMessage && (
                <p className="text-sm text-red-600">{job.errorMessage}</p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleTrain}
          disabled={isTraining || triggerMutation.isPending}
          className="ml-4"
        >
          {(isTraining || triggerMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isTraining ? 'Training...' : 'Train AI'}
        </Button>
      </div>
    </Card>
  );
}
