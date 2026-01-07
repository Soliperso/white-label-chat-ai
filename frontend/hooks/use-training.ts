import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrainingSources,
  addTrainingUrl,
  uploadTrainingFile,
  addTrainingQA,
  deleteTrainingSource,
  triggerTraining,
  fetchTrainingStatus,
} from '@/lib/api-client';

const QUERY_KEYS = {
  sources: (widgetId: string) => ['training-sources', widgetId] as const,
  status: (widgetId: string) => ['training-status', widgetId] as const,
};

export function useTrainingSources(widgetId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sources(widgetId),
    queryFn: () => fetchTrainingSources(widgetId),
    enabled: !!widgetId,
  });
}

export function useAddTrainingUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      widgetId,
      url,
      crawlDepth,
    }: {
      widgetId: string;
      url: string;
      crawlDepth: number;
    }) => addTrainingUrl(widgetId, url, crawlDepth),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources(variables.widgetId),
      });
    },
  });
}

export function useUploadTrainingFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ widgetId, file }: { widgetId: string; file: File }) =>
      uploadTrainingFile(widgetId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources(variables.widgetId),
      });
    },
  });
}

export function useAddTrainingQA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      widgetId,
      question,
      answer,
    }: {
      widgetId: string;
      question: string;
      answer: string;
    }) => addTrainingQA(widgetId, question, answer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources(variables.widgetId),
      });
    },
  });
}

export function useDeleteTrainingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, widgetId }: { sourceId: string; widgetId: string }) =>
      deleteTrainingSource(sourceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources(variables.widgetId),
      });
    },
  });
}

export function useTriggerTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widgetId: string) => triggerTraining(widgetId),
    onSuccess: (_, widgetId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.status(widgetId),
      });
    },
  });
}

export function useTrainingStatus(widgetId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.status(widgetId),
    queryFn: () => fetchTrainingStatus(widgetId),
    enabled: enabled && !!widgetId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 5 seconds if job is processing
      if (data && (data.status === 'queued' || data.status === 'processing')) {
        return 5000;
      }
      return false;
    },
  });
}
