'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    newConversations: true,
    widgetActivity: true,
    weeklyReports: true,
    productUpdates: false,
    securityAlerts: true,
  });

  const [inAppNotifications, setInAppNotifications] = useState({
    newMessages: true,
    mentions: true,
    systemUpdates: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Notification preferences updated');
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose what email notifications you want to receive
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-conversations">New Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new chat conversation starts
                </p>
              </div>
              <Checkbox
                id="new-conversations"
                checked={emailNotifications.newConversations}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, newConversations: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="widget-activity">Widget Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about your widget performance and usage
                </p>
              </div>
              <Checkbox
                id="widget-activity"
                checked={emailNotifications.widgetActivity}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, widgetActivity: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly analytics and performance summaries
                </p>
              </div>
              <Checkbox
                id="weekly-reports"
                checked={emailNotifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, weeklyReports: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="product-updates">Product Updates</Label>
                <p className="text-sm text-muted-foreground">
                  News about new features and improvements
                </p>
              </div>
              <Checkbox
                id="product-updates"
                checked={emailNotifications.productUpdates}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, productUpdates: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-alerts">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important security and account notifications
                </p>
              </div>
              <Checkbox
                id="security-alerts"
                checked={emailNotifications.securityAlerts}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, securityAlerts: checked as boolean })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              In-App Notifications
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage notifications within the dashboard
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-messages">New Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for new chat messages
                </p>
              </div>
              <Checkbox
                id="new-messages"
                checked={inAppNotifications.newMessages}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, newMessages: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mentions">Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone mentions you in a conversation
                </p>
              </div>
              <Checkbox
                id="mentions"
                checked={inAppNotifications.mentions}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, mentions: checked as boolean })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Platform maintenance and system notifications
                </p>
              </div>
              <Checkbox
                id="system-updates"
                checked={inAppNotifications.systemUpdates}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, systemUpdates: checked as boolean })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="text-white">
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}
