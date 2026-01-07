import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Subscription, PaymentHistory } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch current subscription
async function fetchSubscription(): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/billing/subscription`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription');
  }
  return response.json();
}

// Fetch payment history
async function fetchPaymentHistory(): Promise<PaymentHistory[]> {
  const response = await fetch(`${API_URL}/api/billing/payment-history`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment history');
  }
  return response.json();
}

// Upgrade subscription
async function upgradeSubscription(plan: string): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/billing/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (!response.ok) {
    throw new Error('Failed to upgrade subscription');
  }
  return response.json();
}

// Cancel subscription
async function cancelSubscription(): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/billing/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
  return response.json();
}

// Update payment method
async function updatePaymentMethod(paymentData: any): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/billing/payment-method`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) {
    throw new Error('Failed to update payment method');
  }
  return response.json();
}

// Hooks
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ['payment-history'],
    queryFn: fetchPaymentHistory,
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
