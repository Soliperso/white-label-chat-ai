import { http, HttpResponse } from 'msw';
import { db, generateId } from '../db';
import type { Widget, CreateWidgetDto, UpdateWidgetDto } from '@/types';

const BASE_URL = 'http://localhost:3001/api';

export const widgetHandlers = [
  // GET /api/widgets - List all widgets
  http.get(`${BASE_URL}/widgets`, () => {
    console.log('[MSW] Intercepted GET /api/widgets');
    console.log('[MSW] Returning', db.widgets.length, 'widgets');
    return HttpResponse.json({
      widgets: db.widgets,
    });
  }),

  // POST /api/widgets - Create widget
  http.post(`${BASE_URL}/widgets`, async ({ request }) => {
    const body = await request.json() as CreateWidgetDto;

    const newWidget: Widget = {
      id: generateId('widget'),
      name: body.name,
      organizationId: 'org-1', // Hardcoded for MVP
      clientId: null,
      theme: {
        primaryColor: body.theme?.primaryColor || '#3b82f6',
        secondaryColor: body.theme?.secondaryColor || '#1e40af',
        mode: body.theme?.mode || 'light',
      },
      config: {
        welcomeMessage: body.config?.welcomeMessage || 'Hi! How can I help you?',
        placeholderText: body.config?.placeholderText || 'Type your message...',
        position: body.config?.position || 'bottom-right',
        autoOpenDelay: body.config?.autoOpenDelay ?? null,
        showBranding: body.config?.showBranding ?? true,
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.widgets.push(newWidget);

    return HttpResponse.json(
      { widget: newWidget },
      { status: 201 }
    );
  }),

  // GET /api/widgets/:id - Get single widget
  http.get(`${BASE_URL}/widgets/:id`, ({ params }) => {
    const { id } = params;
    console.log('[MSW] Intercepted GET /api/widgets/:id with id:', id);
    console.log('[MSW] Available widgets:', db.widgets.map(w => w.id));

    const widget = db.widgets.find(w => w.id === id);

    if (!widget) {
      console.log('[MSW] Widget not found:', id);
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Widget not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    console.log('[MSW] Returning widget:', widget.name);
    return HttpResponse.json({ widget });
  }),

  // PATCH /api/widgets/:id - Update widget
  http.patch(`${BASE_URL}/widgets/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as UpdateWidgetDto;

    const widgetIndex = db.widgets.findIndex(w => w.id === id);

    if (widgetIndex === -1) {
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Widget not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    const widget = db.widgets[widgetIndex];

    // Update widget fields
    const updatedWidget: Widget = {
      ...widget,
      name: body.name ?? widget.name,
      theme: {
        ...widget.theme,
        ...body.theme,
      },
      config: {
        ...widget.config,
        ...body.config,
      },
      updatedAt: new Date().toISOString(),
    };

    db.widgets[widgetIndex] = updatedWidget;

    return HttpResponse.json({ widget: updatedWidget });
  }),

  // DELETE /api/widgets/:id - Delete widget
  http.delete(`${BASE_URL}/widgets/:id`, ({ params }) => {
    const { id } = params;
    const widgetIndex = db.widgets.findIndex(w => w.id === id);

    if (widgetIndex === -1) {
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Widget not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    db.widgets.splice(widgetIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
