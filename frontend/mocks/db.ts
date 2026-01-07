import { Widget, ChatMessage, Conversation, TeamMember, Subscription, PaymentHistory } from '@/types';

// In-memory database
export const db = {
  widgets: [] as Widget[],
  conversations: [] as Conversation[],
  messages: [] as ChatMessage[],
  teamMembers: [] as TeamMember[],
  subscription: null as Subscription | null,
  paymentHistory: [] as PaymentHistory[],
};

// Helper to generate IDs
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize with some mock widgets
export function initializeDb() {
  // Create timestamps for realistic "time ago" displays
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  db.widgets = [
    {
      id: 'widget-1',
      name: 'Main Chat',
      category: 'Website',
      messagesThisMonth: 1245,
      organizationId: 'org-1',
      clientId: null,
      theme: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        mode: 'light' as const,
      },
      config: {
        welcomeMessage: '👋 Hi! How can I help you today?',
        placeholderText: 'Type your message...',
        position: 'bottom-right' as const,
        autoOpenDelay: null,
        showBranding: true,
      },
      status: 'active' as const,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'widget-2',
      name: 'Portal Bot',
      category: 'Support',
      messagesThisMonth: 890,
      organizationId: 'org-1',
      clientId: null,
      theme: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        mode: 'light' as const,
      },
      config: {
        welcomeMessage: 'Welcome! Looking for product information?',
        placeholderText: 'Ask me anything...',
        position: 'bottom-right' as const,
        autoOpenDelay: 3000,
        showBranding: false,
      },
      status: 'active' as const,
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: oneDayAgo.toISOString(),
    },
    {
      id: 'widget-3',
      name: 'Portal Bot',
      category: 'Support',
      messagesThisMonth: 45,
      organizationId: 'org-1',
      clientId: null,
      theme: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        mode: 'light' as const,
      },
      config: {
        welcomeMessage: 'Need help with sales inquiries?',
        placeholderText: 'What would you like to know?',
        position: 'bottom-right' as const,
        autoOpenDelay: null,
        showBranding: true,
      },
      status: 'active' as const,
      createdAt: new Date('2024-01-25').toISOString(),
      updatedAt: oneDayAgo.toISOString(),
    },
    {
      id: 'widget-4',
      name: 'Landing Page Promo',
      messagesThisMonth: 0,
      organizationId: 'org-1',
      clientId: null,
      theme: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        mode: 'light' as const,
      },
      config: {
        welcomeMessage: 'Welcome! Let me help you get started.',
        placeholderText: 'Type your question...',
        position: 'bottom-right' as const,
        autoOpenDelay: 5000,
        showBranding: true,
      },
      status: 'draft' as const,
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
    },
    {
      id: 'widget-5',
      name: 'Internal FAQ Helper',
      messagesThisMonth: 45,
      organizationId: 'org-1',
      clientId: null,
      theme: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        mode: 'light' as const,
      },
      config: {
        welcomeMessage: 'Welcome! How can I assist with FAQs?',
        placeholderText: 'Type your question...',
        position: 'bottom-right' as const,
        autoOpenDelay: null,
        showBranding: true,
      },
      status: 'draft' as const,
      createdAt: new Date('2024-01-08').toISOString(),
      updatedAt: new Date('2024-01-08').toISOString(),
    },
  ];

  // Initialize team members
  db.teamMembers = [
    {
      id: 'member-1',
      email: 'admin@chatforge.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      organizationId: 'org-1',
      createdAt: new Date('2024-01-01').toISOString(),
      lastActive: now.toISOString(),
    },
    {
      id: 'member-2',
      email: 'manager@chatforge.com',
      name: 'Sarah Johnson',
      role: 'manager',
      status: 'active',
      organizationId: 'org-1',
      createdAt: new Date('2024-01-05').toISOString(),
      lastActive: twoHoursAgo.toISOString(),
    },
    {
      id: 'member-3',
      email: 'viewer@chatforge.com',
      name: 'Mike Chen',
      role: 'viewer',
      status: 'active',
      organizationId: 'org-1',
      createdAt: new Date('2024-01-10').toISOString(),
      lastActive: oneDayAgo.toISOString(),
    },
    {
      id: 'member-4',
      email: 'pending@chatforge.com',
      name: 'Jane Smith',
      role: 'viewer',
      status: 'pending',
      organizationId: 'org-1',
      createdAt: new Date('2024-01-28').toISOString(),
    },
  ];

  // Initialize subscription
  const nextBillingDate = new Date(now);
  nextBillingDate.setDate(nextBillingDate.getDate() + 15);

  db.subscription = {
    id: 'sub-1',
    organizationId: 'org-1',
    plan: 'pro',
    status: 'active',
    price: 99,
    currentPeriodStart: new Date('2024-01-01').toISOString(),
    currentPeriodEnd: nextBillingDate.toISOString(),
    cancelAtPeriodEnd: false,
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2026,
    },
    usage: {
      messagesUsed: 7543,
      messagesLimit: 10000,
      widgetsUsed: 3,
      widgetsLimit: 5,
      teamMembersUsed: 4,
      teamMembersLimit: 10,
      messagesThisMonth: 7543,
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: now.toISOString(),
  };

  // Initialize payment history
  db.paymentHistory = [
    {
      id: 'inv-1',
      organizationId: 'org-1',
      invoiceNumber: 'INV-2024-001',
      amount: 99.00,
      status: 'paid',
      date: new Date('2024-01-01').toISOString(),
      description: 'Pro Plan - January 2024',
    },
    {
      id: 'inv-2',
      organizationId: 'org-1',
      invoiceNumber: 'INV-2023-012',
      amount: 99.00,
      status: 'paid',
      date: new Date('2023-12-01').toISOString(),
      description: 'Pro Plan - December 2023',
    },
    {
      id: 'inv-3',
      organizationId: 'org-1',
      invoiceNumber: 'INV-2023-011',
      amount: 99.00,
      status: 'paid',
      date: new Date('2023-11-01').toISOString(),
      description: 'Pro Plan - November 2023',
    },
    {
      id: 'inv-4',
      organizationId: 'org-1',
      invoiceNumber: 'INV-2023-010',
      amount: 29.00,
      status: 'paid',
      date: new Date('2023-10-01').toISOString(),
      description: 'Starter Plan - October 2023',
    },
  ];
}

// Initialize database
initializeDb();
