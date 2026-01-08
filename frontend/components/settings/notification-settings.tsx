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
      <Card className="p-6 border border-[#E0E0E0] rounded-lg">
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#212121]">
              <Mail className="h-6 w-6 text-[#2196F3]" />
              Email Notifications
            </h3>
            <p className="text-sm text-[#757575] mt-1">
              Choose what email notifications you want to receive
            </p>
          </div>

          <Separator className="bg-[#E0E0E0]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="new-conversations" className="text-base font-medium text-[#212121] cursor-pointer">
                  New Conversations
                </Label>
                <p className="text-sm text-[#757575]">
                  Get notified when a new chat conversation starts
                </p>
              </div>
              <Checkbox
                id="new-conversations"
                checked={emailNotifications.newConversations}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, newConversations: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="widget-activity" className="text-base font-medium text-[#212121] cursor-pointer">
                  Widget Activity
                </Label>
                <p className="text-sm text-[#757575]">
                  Updates about your widget performance and usage
                </p>
              </div>
              <Checkbox
                id="widget-activity"
                checked={emailNotifications.widgetActivity}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, widgetActivity: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="weekly-reports" className="text-base font-medium text-[#212121] cursor-pointer">
                  Weekly Reports
                </Label>
                <p className="text-sm text-[#757575]">
                  Receive weekly analytics and performance summaries
                </p>
              </div>
              <Checkbox
                id="weekly-reports"
                checked={emailNotifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, weeklyReports: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="product-updates" className="text-base font-medium text-[#212121] cursor-pointer">
                  Product Updates
                </Label>
                <p className="text-sm text-[#757575]">
                  News about new features and improvements
                </p>
              </div>
              <Checkbox
                id="product-updates"
                checked={emailNotifications.productUpdates}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, productUpdates: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="security-alerts" className="text-base font-medium text-[#212121] cursor-pointer">
                  Security Alerts
                </Label>
                <p className="text-sm text-[#757575]">
                  Important security and account notifications
                </p>
              </div>
              <Checkbox
                id="security-alerts"
                checked={emailNotifications.securityAlerts}
                onCheckedChange={(checked) =>
                  setEmailNotifications({ ...emailNotifications, securityAlerts: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-[#E0E0E0] rounded-lg">
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#212121]">
              <Bell className="h-6 w-6 text-[#2196F3]" />
              In-App Notifications
            </h3>
            <p className="text-sm text-[#757575] mt-1">
              Manage notifications within the dashboard
            </p>
          </div>

          <Separator className="bg-[#E0E0E0]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="new-messages" className="text-base font-medium text-[#212121] cursor-pointer">
                  New Messages
                </Label>
                <p className="text-sm text-[#757575]">
                  Show notifications for new chat messages
                </p>
              </div>
              <Checkbox
                id="new-messages"
                checked={inAppNotifications.newMessages}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, newMessages: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="mentions" className="text-base font-medium text-[#212121] cursor-pointer">
                  Mentions
                </Label>
                <p className="text-sm text-[#757575]">
                  When someone mentions you in a conversation
                </p>
              </div>
              <Checkbox
                id="mentions"
                checked={inAppNotifications.mentions}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, mentions: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>

            <Separator className="bg-[#E0E0E0]" />

            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="system-updates" className="text-base font-medium text-[#212121] cursor-pointer">
                  System Updates
                </Label>
                <p className="text-sm text-[#757575]">
                  Platform maintenance and system notifications
                </p>
              </div>
              <Checkbox
                id="system-updates"
                checked={inAppNotifications.systemUpdates}
                onCheckedChange={(checked) =>
                  setInAppNotifications({ ...inAppNotifications, systemUpdates: checked as boolean })
                }
                className="h-5 w-5 border-2 border-[#BDBDBD] data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] transition-colors"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-[#2196F3] hover:bg-[#1976D2] text-white">
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}
