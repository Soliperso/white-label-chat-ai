// User & Organization Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  organizationId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  organizationId: string;
  createdAt: string;
  lastActive?: string;
}

export interface InviteTeamMemberDto {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface UpdateTeamMemberDto {
  role?: 'admin' | 'manager' | 'viewer';
  status?: 'active' | 'pending' | 'inactive';
}

// Billing & Subscription Types
export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  price: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    type: 'card';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  usage: {
    messagesUsed: number;
    messagesLimit: number;
    widgetsUsed: number;
    widgetsLimit: number;
    teamMembersUsed: number;
    teamMembersLimit: number;
    messagesThisMonth: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  description: string;
  downloadUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'agency' | 'client';
  parentOrganizationId: string | null;
  branding: {
    logoUrl: string | null;
    primaryColor: string;
    companyName: string;
  };
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  organizationId: string;
  domain: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Widget Types
export interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  mode: 'light' | 'dark' | 'auto';
}

export interface WidgetConfig {
  welcomeMessage: string;
  placeholderText: string;
  position: 'bottom-right' | 'bottom-left' | 'inline';
  autoOpenDelay: number | null;
  showBranding: boolean;
}

export interface Widget {
  id: string;
  name: string;
  category?: string;
  organizationId: string;
  clientId: string | null;
  theme: WidgetTheme;
  config: WidgetConfig;
  status: 'active' | 'inactive' | 'draft';
  messagesThisMonth?: number;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  confidence?: number;
}

export interface Conversation {
  id: string;
  widgetId: string;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Form DTOs
export interface CreateWidgetDto {
  name: string;
  theme?: Partial<WidgetTheme>;
  config?: Partial<WidgetConfig>;
}

export interface UpdateWidgetDto extends Partial<CreateWidgetDto> {}

export interface SendMessageDto {
  message: string;
  conversationId?: string;
}

export interface ChatResponseDto {
  conversationId: string;
  response: ChatMessage;
}

// Training Types
export interface TrainingSource {
  id: string;
  widgetId: string;
  organizationId: string;
  type: 'url' | 'file' | 'qna';
  name: string;
  // Type-specific fields
  url?: string;
  crawlDepth?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  question?: string;
  answer?: string;
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string | null;
  totalChunks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJob {
  id: string;
  widgetId: string;
  organizationId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddTrainingSourceDto {
  type: 'url' | 'file' | 'qna';
  url?: string;
  crawlDepth?: number;
  question?: string;
  answer?: string;
}

// API Response Types
export interface WidgetsResponse {
  widgets: Widget[];
}

export interface WidgetResponse {
  widget: Widget;
}

// Mock Constants
export const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@chatforge.com',
  name: 'Demo User',
  role: 'admin',
  organizationId: 'org-1',
  createdAt: new Date().toISOString(),
};

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'Demo Agency',
  type: 'agency',
  parentOrganizationId: null,
  branding: {
    logoUrl: null,
    primaryColor: '#3b82f6',
    companyName: 'Demo Agency',
  },
  plan: 'pro',
  createdAt: new Date().toISOString(),
};
