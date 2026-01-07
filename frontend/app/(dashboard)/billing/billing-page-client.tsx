'use client';

import { CreditCard, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrentPlanCard } from '@/components/billing/current-plan-card';
import { SubscriptionPlans } from '@/components/billing/subscription-plans';
import { PaymentHistory } from '@/components/billing/payment-history';
import { UsageMetrics } from '@/components/billing/usage-metrics';
import { useSubscription } from '@/hooks/use-billing';

export function BillingPageClient() {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your subscription, billing, and usage
        </p>
      </div>

      {/* Current Plan Overview */}
      <CurrentPlanCard subscription={subscription} />

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlans currentPlan={subscription?.plan} />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <UsageMetrics subscription={subscription} />
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <PaymentHistory />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
