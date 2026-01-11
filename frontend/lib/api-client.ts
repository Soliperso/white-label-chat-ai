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
import { createClient } from './supabase/client';

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

/**
 * Get authentication headers with Supabase JWT token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Handle 401 Unauthorized - session expired
  if (response.status === 401) {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session_expired=true';
    }

    throw new ApiError('Session expired. Please log in again.', 401);
  }

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
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets`, { headers });
  const data = await handleResponse<WidgetsResponse>(response);
  return data.widgets;
}

export async function fetchWidget(id: string): Promise<Widget> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`, { headers });
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function createWidget(dto: CreateWidgetDto): Promise<Widget> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dto),
  });
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function updateWidget(
  id: string,
  dto: UpdateWidgetDto
): Promise<Widget> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(dto),
  });
  const data = await handleResponse<WidgetResponse>(response);
  return data.widget;
}

export async function deleteWidget(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
    method: 'DELETE',
    headers,
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
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources`, { headers });
  const data = await handleResponse<{ sources: TrainingSource[] }>(response);
  return data.sources;
}

export async function addTrainingUrl(
  widgetId: string,
  url: string,
  crawlDepth: number
): Promise<TrainingSource> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'url', url, crawlDepth }),
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function uploadTrainingFile(
  widgetId: string,
  file: File
): Promise<TrainingSource> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'file');

  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/file`, {
    method: 'POST',
    headers, // Don't set Content-Type for FormData; browser sets it with boundary
    body: formData,
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function addTrainingQA(
  widgetId: string,
  question: string,
  answer: string
): Promise<TrainingSource> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/sources/qna`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'qna', question, answer }),
  });
  const data = await handleResponse<{ source: TrainingSource }>(response);
  return data.source;
}

export async function deleteTrainingSource(sourceId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/training/sources/${sourceId}`, {
    method: 'DELETE',
    headers,
  });
  await handleResponse<void>(response);
}

export async function triggerTraining(widgetId: string): Promise<TrainingJob> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/trigger`, {
    method: 'POST',
    headers,
  });
  const data = await handleResponse<{ job: TrainingJob }>(response);
  return data.job;
}

export async function fetchTrainingStatus(widgetId: string): Promise<TrainingJob | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/widgets/${widgetId}/training/status`, { headers });
  const data = await handleResponse<{ job: TrainingJob | null }>(response);
  return data.job;
}

// User profile API functions
export async function updateProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; email?: string }
): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function updatePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<{ message: string }>(response);
}

export async function uploadProfilePicture(userId: string, file: File): Promise<User> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse<User>(response);
}

export async function deleteProfilePicture(userId: string): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse<User>(response);
}
