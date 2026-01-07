'use client';

import { MessageSquare, Zap, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Subscription } from '@/types';

interface UsageMetricsProps {
  subscription?: Subscription;
}

export function UsageMetrics({ subscription }: UsageMetricsProps) {
  if (!subscription) {
    return null;
  }

  const messageUsagePercent = (subscription.usage.messagesUsed / subscription.usage.messagesLimit) * 100;
  const widgetUsagePercent = (subscription.usage.widgetsUsed / subscription.usage.widgetsLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">Messages</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {subscription.usage.messagesUsed.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              of {subscription.usage.messagesLimit.toLocaleString()} used
            </div>
            <Progress value={messageUsagePercent} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">Widgets</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {subscription.usage.widgetsUsed}
            </div>
            <div className="text-xs text-muted-foreground">
              of {subscription.usage.widgetsLimit} used
            </div>
            <Progress value={widgetUsagePercent} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">Team Members</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {subscription.usage.teamMembersUsed}
            </div>
            <div className="text-xs text-muted-foreground">
              of {subscription.usage.teamMembersLimit} used
            </div>
            <Progress
              value={(subscription.usage.teamMembersUsed / subscription.usage.teamMembersLimit) * 100}
              className="h-2"
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">This Month</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {subscription.usage.messagesThisMonth.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">messages sent</div>
            <div className="text-xs text-green-600 font-medium">
              +12% from last month
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Usage Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage Details</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">API Requests</div>
              <div className="text-sm text-muted-foreground">Total API calls this month</div>
            </div>
            <div className="text-xl font-bold">2,847</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Training Data</div>
              <div className="text-sm text-muted-foreground">Documents and URLs indexed</div>
            </div>
            <div className="text-xl font-bold">156 items</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Storage Used</div>
              <div className="text-sm text-muted-foreground">Vector database storage</div>
            </div>
            <div className="text-xl font-bold">1.2 GB</div>
          </div>
        </div>
      </Card>

      {/* Usage Warning if near limit */}
      {messageUsagePercent > 80 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Approaching Usage Limit</h4>
              <p className="text-sm text-orange-700 mt-1">
                You've used {messageUsagePercent.toFixed(0)}% of your monthly message quota.
                Consider upgrading your plan to avoid service interruption.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
