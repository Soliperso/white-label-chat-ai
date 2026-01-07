import { http, HttpResponse } from 'msw';
import { db } from '../db';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const billingHandlers = [
  // GET /api/billing/subscription - Get current subscription
  http.get(`${API_URL}/api/billing/subscription`, () => {
    console.log('[MSW] GET /api/billing/subscription - Fetching subscription');
    return HttpResponse.json(db.subscription);
  }),

  // GET /api/billing/payment-history - Get payment history
  http.get(`${API_URL}/api/billing/payment-history`, () => {
    console.log('[MSW] GET /api/billing/payment-history - Fetching payment history');
    return HttpResponse.json(db.paymentHistory);
  }),

  // POST /api/billing/upgrade - Upgrade subscription plan
  http.post(`${API_URL}/api/billing/upgrade`, async ({ request }) => {
    console.log('[MSW] POST /api/billing/upgrade - Upgrading subscription');
    const { plan } = (await request.json()) as { plan: string };

    if (!db.subscription) {
      return HttpResponse.json({ message: 'No subscription found' }, { status: 404 });
    }

    // Update plan and price
    const prices: Record<string, number> = {
      free: 0,
      starter: 29,
      pro: 99,
      enterprise: 299,
    };

    db.subscription.plan = plan as any;
    db.subscription.price = prices[plan] || 0;
    db.subscription.updatedAt = new Date().toISOString();

    console.log('[MSW] Subscription upgraded to:', plan);
    return HttpResponse.json(db.subscription);
  }),

  // POST /api/billing/cancel - Cancel subscription
  http.post(`${API_URL}/api/billing/cancel`, () => {
    console.log('[MSW] POST /api/billing/cancel - Canceling subscription');

    if (!db.subscription) {
      return HttpResponse.json({ message: 'No subscription found' }, { status: 404 });
    }

    db.subscription.cancelAtPeriodEnd = true;
    db.subscription.updatedAt = new Date().toISOString();

    console.log('[MSW] Subscription will cancel at period end');
    return HttpResponse.json(db.subscription);
  }),

  // PUT /api/billing/payment-method - Update payment method
  http.put(`${API_URL}/api/billing/payment-method`, async ({ request }) => {
    console.log('[MSW] PUT /api/billing/payment-method - Updating payment method');
    const paymentData = await request.json();

    if (!db.subscription) {
      return HttpResponse.json({ message: 'No subscription found' }, { status: 404 });
    }

    db.subscription.paymentMethod = {
      ...db.subscription.paymentMethod,
      ...(paymentData as any),
    };
    db.subscription.updatedAt = new Date().toISOString();

    console.log('[MSW] Payment method updated');
    return HttpResponse.json(db.subscription);
  }),
];
