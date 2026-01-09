import type {
  Widget,
  CreateWidgetDto,
  UpdateWidgetDto,
  WidgetsResponse,
  WidgetResponse,
  TrainingSource,
  TrainingJob,
  AddTrainingSourceDto,
} from '@/types';
import type { User } from './auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export async function fetchWidgets(): Promise<Widget[]> {
  const response = await fetch(`${API_BASE_URL}/widgets`);
  const data = await handleResponse<WidgetsResponse>(response);
  return data.widgets;
}

export async function fetchWidget(id: string): Promise<Widget> {
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`);
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function createWidget(dto: CreateWidgetDto): Promise<Widget> {
  const response = await fetch(`${API_BASE_URL}/widgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function updateWidget(
  id: string,
  dto: UpdateWidgetDto
): Promise<Widget> {
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function deleteWidget(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function sendMessage(
  widgetId: string,
  message: string,
  conversationId?: string
): Promise<{ conversationId: string; response: import('@/types').ChatMessage }> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });
  return handleResponse(response);
}

// Training API functions
export async function fetchTrainingSources(widgetId: string): Promise<TrainingSource[]> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources`);
  const data = await handleResponse<{ sources: TrainingSource[] }>(response);
  return data.sources;
}

export async function addTrainingUrl(
  widgetId: string,
  url: string,
  crawlDepth: number
): Promise<TrainingSource> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'url', url, crawlDepth }),
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function uploadTrainingFile(
  widgetId: string,
  file: File
): Promise<TrainingSource> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'file');

  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/file`, {
    method: 'POST',
    body: formData, // Don't set Content-Type; browser sets it with boundary
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function addTrainingQA(
  widgetId: string,
  question: string,
  answer: string
): Promise<TrainingSource> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/qna`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'qna', question, answer }),
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function deleteTrainingSource(sourceId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/training/sources/${sourceId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function triggerTraining(widgetId: string): Promise<TrainingJob> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse<{ job: TrainingJob }>(response);
  return data.job;
}

export async function fetchTrainingStatus(widgetId: string): Promise<TrainingJob | null> {
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/status`);
  const data = await handleResponse<{ job: TrainingJob | null }>(response);
  return data.job;
}

// User profile API functions
export async function uploadProfilePicture(userId: string, file: File): Promise<User> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<User>(response);
}

export async function deleteProfilePicture(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
    method: 'DELETE',
  });
  return handleResponse<User>(response);
}
