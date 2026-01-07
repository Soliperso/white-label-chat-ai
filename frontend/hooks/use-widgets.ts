import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchWidgets,
  fetchWidget,
  createWidget,
  updateWidget,
  deleteWidget,
} from '@/lib/api-client';
import type { CreateWidgetDto, UpdateWidgetDto } from '@/types';

const QUERY_KEYS = {
  widgets: ['widgets'] as const,
  widget: (id: string) => ['widgets', id] as const,
};

export function useWidgets() {
  return useQuery({
    queryKey: QUERY_KEYS.widgets,
    queryFn: fetchWidgets,
  });
}

export function useWidget(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.widget(id),
    queryFn: () => fetchWidget(id),
    enabled: !!id,
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWidgetDto) => createWidget(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets });
    },
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWidgetDto }) =>
      updateWidget(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widget(data.id) });
    },
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWidget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets });
    },
  });
}
