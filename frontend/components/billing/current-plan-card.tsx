'use client';

import { CheckCircle2, TrendingUp, Calendar, CreditCard, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Subscription } from '@/types';

interface CurrentPlanCardProps {
  subscription?: Subscription;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  if (!subscription) {
    return null;
  }

  const usagePercentage = (subscription.usage.messagesUsed / subscription.usage.messagesLimit) * 100;
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      {/* Main Plan Card */}
      <Card className="relative overflow-hidden border-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold capitalize">{subscription.plan} Plan</h2>
                {subscription.status === 'active' ? (
                  <Badge className="gap-1.5 px-3 py-1 text-white bg-green-600 hover:bg-green-600 border-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    {subscription.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Your current subscription plan and usage
              </p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages Used</p>
                  <p className="text-2xl font-bold mt-1">
                    {subscription.usage.messagesUsed.toLocaleString()}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      / {subscription.usage.messagesLimit.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold">
                    {(subscription.usage.messagesLimit - subscription.usage.messagesUsed).toLocaleString()}
                  </p>
                </div>
              </div>
              <Progress
                value={usagePercentage}
                className="h-3"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {usagePercentage.toFixed(1)}% used
                </span>
                {usagePercentage > 80 && (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Consider upgrading
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button size="lg" className="gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-white" />
              Upgrade Plan
            </Button>
            <Button size="lg" variant="outline">
              Manage Billing
            </Button>
          </div>
        </div>
      </Card>

      {/* Side Info Cards */}
      <div className="space-y-4">
        {/* Pricing Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${subscription.price}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Billed monthly • Auto-renews
            </p>
          </div>
        </Card>

        {/* Billing Info */}
        <Card className="divide-y">
          <div className="p-4 flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Next Billing</p>
              <p className="text-2xl font-bold mt-1">{daysUntilRenewal} days</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Payment Method</p>
              <p className="text-lg font-semibold mt-1">•••• {subscription.paymentMethod.last4}</p>
              <button className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                Update payment method
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
