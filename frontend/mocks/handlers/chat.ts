import { http, HttpResponse } from 'msw';
import { generateId } from '../db';
import type { SendMessageDto, ChatResponseDto } from '@/types';

const BASE_URL = 'http://localhost:3001/api';

// Mock responses based on keywords
const mockResponses = [
  {
    trigger: /hours|time|open|schedule/i,
    response: "We're open Monday-Friday, 9am-5pm EST!",
  },
  {
    trigger: /price|cost|pricing|plan/i,
    response: "Our pricing starts at $29/month. Visit our pricing page for full details.",
  },
  {
    trigger: /contact|support|help|email/i,
    response: "You can reach us at support@example.com or call 1-800-EXAMPLE.",
  },
  {
    trigger: /demo|trial|test/i,
    response: "Yes! We offer a 14-day free trial. No credit card required.",
  },
];

export const chatHandlers = [
  // POST /api/widgets/:id/chat - Send message and get response
  http.post(`${BASE_URL}/widgets/:widgetId/chat`, async ({ params, request }) => {
    const { widgetId } = params;
    const body = await request.json() as SendMessageDto;

    // Find matching mock response
    const match = mockResponses.find(m => m.trigger.test(body.message));

    const conversationId = body.conversationId || generateId('conv');

    const response: ChatResponseDto = {
      conversationId,
      response: {
        id: generateId('msg'),
        conversationId,
        content: match?.response || "I'm a demo bot. I can help with hours, pricing, contact info, and trials!",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        confidence: 0.85,
      },
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return HttpResponse.json(response);
  }),
];
