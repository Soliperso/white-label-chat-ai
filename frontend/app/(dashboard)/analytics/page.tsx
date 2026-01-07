'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart,
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

interface WidgetPerformance {
  widgetName: string;
  conversations: number;
  messages: number;
  avgResponseTime: string;
  resolutionRate: number;
}

export default function AnalyticsPage() {
  // Mock data - will be replaced with API calls
  const overallMetrics: AnalyticsMetric[] = [
    {
      label: 'Total Conversations',
      value: '4,567',
      change: 15.3,
      changeLabel: 'vs last month',
      icon: MessageSquare,
      trend: 'up',
    },
    {
      label: 'Total Messages',
      value: '23,891',
      change: 12.8,
      changeLabel: 'vs last month',
      icon: Users,
      trend: 'up',
    },
    {
      label: 'Avg Response Time',
      value: '1.4s',
      change: -8.2,
      changeLabel: 'vs last month',
      icon: Clock,
      trend: 'up', // Lower is better
    },
    {
      label: 'Overall Resolution Rate',
      value: '85%',
      change: 2.5,
      changeLabel: 'vs last month',
      icon: CheckCircle,
      trend: 'up',
    },
  ];

  const widgetPerformance: WidgetPerformance[] = [
    {
      widgetName: 'Customer Support Widget',
      conversations: 1234,
      messages: 8456,
      avgResponseTime: '1.2s',
      resolutionRate: 87,
    },
    {
      widgetName: 'Sales Assistant Widget',
      conversations: 987,
      messages: 5632,
      avgResponseTime: '1.5s',
      resolutionRate: 83,
    },
    {
      widgetName: 'Product Help Widget',
      conversations: 756,
      messages: 4201,
      avgResponseTime: '1.3s',
      resolutionRate: 89,
    },
    {
      widgetName: 'FAQ Widget',
      conversations: 1590,
      messages: 5602,
      avgResponseTime: '1.6s',
      resolutionRate: 81,
    },
  ];

  const conversationData = [
    { date: 'Mon', conversations: 580 },
    { date: 'Tue', conversations: 620 },
    { date: 'Wed', conversations: 550 },
    { date: 'Thu', conversations: 710 },
    { date: 'Fri', conversations: 680 },
    { date: 'Sat', conversations: 420 },
    { date: 'Sun', conversations: 390 },
  ];

  const maxConversations = Math.max(...conversationData.map((d) => d.conversations));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Overview of performance across all your widgets
        </p>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overallMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp
                      className={`w-3 h-3 ${
                        metric.trend === 'up'
                          ? 'text-green-600'
                          : metric.trend === 'down'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        metric.trend === 'up'
                          ? 'text-green-600'
                          : metric.trend === 'down'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {metric.changeLabel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversations Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Conversations</CardTitle>
          <CardDescription>Total conversations across all widgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversationData.map((data) => (
              <div key={data.date} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{data.date}</span>
                  <span className="font-medium">{data.conversations}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${(data.conversations / maxConversations) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Widget Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Performance</CardTitle>
          <CardDescription>
            Performance breakdown by individual widgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Widget
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Conversations
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Messages
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Avg Response
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Resolution Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {widgetPerformance.map((widget, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{widget.widgetName}</td>
                    <td className="text-right py-3 px-4">
                      {widget.conversations.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      {widget.messages.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      {widget.avgResponseTime}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          widget.resolutionRate >= 85
                            ? 'bg-green-100 text-green-800'
                            : widget.resolutionRate >= 75
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {widget.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Widgets */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Widgets</CardTitle>
            <CardDescription>By resolution rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...widgetPerformance]
                .sort((a, b) => b.resolutionRate - a.resolutionRate)
                .slice(0, 3)
                .map((widget, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{widget.widgetName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {widget.resolutionRate}% resolution
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Insights</CardTitle>
            <CardDescription>Key statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-muted-foreground">Active Widgets</span>
                <span className="font-semibold text-lg">4</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-muted-foreground">Avg Messages/Conversation</span>
                <span className="font-semibold text-lg">5.2</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-muted-foreground">Peak Day</span>
                <span className="font-semibold text-lg">Thursday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Training Sources</span>
                <span className="font-semibold text-lg">47</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <BarChart className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Analytics Preview
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
                This dashboard displays mock data for demonstration purposes. Real analytics
                will be populated once your widgets receive actual user interactions. Data
                shown represents typical patterns you might see in production.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
