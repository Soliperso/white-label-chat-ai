'use client';

import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/settings/organization-settings';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';

export function SettingsPageClient() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-500/20 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-cyan-500 rounded-lg shadow-md">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#212121]">
            Settings
          </h1>
        </div>
        <p className="text-[#757575]">
          Manage your account, organization, and preferences
        </p>
      </div>

      {/* Enhanced Settings Tabs */}
      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="bg-white border border-[#E0E0E0] p-1">
          <TabsTrigger
            value="organization"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-200"
          >
            Organization
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-200"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-200"
          >
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-4 mt-0">
          <OrganizationSettings />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-0">
          <ProfileSettings />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-0">
          <NotificationSettings />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 mt-0">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
