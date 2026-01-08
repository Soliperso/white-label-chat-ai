"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}

interface ConversationData {
  date: string;
  conversations: number;
  messages: number;
}

interface WidgetAnalyticsProps {
  widgetId: string;
}

export function WidgetAnalytics({ widgetId }: WidgetAnalyticsProps) {
  // Mock data - will be replaced with API calls
  const metrics: AnalyticsMetric[] = [
    {
      label: "Total Conversations",
      value: "1,234",
      change: 12.5,
      changeLabel: "vs last month",
      icon: MessageSquare,
      trend: "up",
    },
    {
      label: "Total Messages",
      value: "8,456",
      change: 8.2,
      changeLabel: "vs last month",
      icon: Users,
      trend: "up",
    },
    {
      label: "Avg Response Time",
      value: "1.2s",
      change: -5.3,
      changeLabel: "vs last month",
      icon: Clock,
      trend: "up", // Lower response time is better
    },
    {
      label: "Resolution Rate",
      value: "87%",
      change: 3.1,
      changeLabel: "vs last month",
      icon: CheckCircle,
      trend: "up",
    },
  ];

  const conversationData: ConversationData[] = [
    { date: "Jan 1", conversations: 45, messages: 234 },
    { date: "Jan 2", conversations: 52, messages: 287 },
    { date: "Jan 3", conversations: 48, messages: 251 },
    { date: "Jan 4", conversations: 61, messages: 312 },
    { date: "Jan 5", conversations: 55, messages: 289 },
    { date: "Jan 6", conversations: 67, messages: 356 },
    { date: "Jan 7", conversations: 72, messages: 401 },
  ];

  const maxConversations = Math.max(...conversationData.map(d => d.conversations));
  const maxMessages = Math.max(...conversationData.map(d => d.messages));

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
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
                        metric.trend === "up"
                          ? "text-green-600"
                          : metric.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        metric.trend === "up"
                          ? "text-green-600"
                          : metric.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversationData.map((data) => (
                <div key={data.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{data.date}</span>
                    <span className="font-medium">{data.conversations}</span>
                  </div>
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(data.conversations / maxConversations) * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Messages Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversationData.map((data) => (
                <div key={data.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{data.date}</span>
                    <span className="font-medium">{data.messages}</span>
                  </div>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(data.messages / maxMessages) * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Queries</CardTitle>
            <CardDescription>Most common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { query: "How do I reset my password?", count: 156 },
                { query: "What are your business hours?", count: 142 },
                { query: "How do I contact support?", count: 128 },
                { query: "Where is my order?", count: 95 },
                { query: "Do you offer refunds?", count: 87 },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="text-sm text-muted-foreground flex-1 line-clamp-1">
                    {item.query}
                  </span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Response Quality</CardTitle>
            <CardDescription>Confidence scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High Confidence</span>
                  <span className="font-medium">72%</span>
                </div>
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "72%" }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medium Confidence</span>
                  <span className="font-medium">21%</span>
                </div>
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "21%" }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Low Confidence</span>
                  <span className="font-medium">7%</span>
                </div>
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: "7%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Most active times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "9:00 AM - 10:00 AM", usage: 85 },
                { time: "2:00 PM - 3:00 PM", usage: 78 },
                { time: "11:00 AM - 12:00 PM", usage: 72 },
                { time: "3:00 PM - 4:00 PM", usage: 68 },
                { time: "10:00 AM - 11:00 AM", usage: 65 },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.time}</span>
                    <span className="font-medium">{item.usage}%</span>
                  </div>
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${item.usage}%` }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Analytics Preview
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
                This is a preview with mock data. Real analytics will be available once
                your widget starts receiving conversations. The data shown here
                represents typical patterns you might see.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
