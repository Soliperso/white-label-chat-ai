'use client';

import { useState } from 'react';
import { Building2, Upload, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function OrganizationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Acme Agency',
    website: 'https://acme-agency.com',
    email: 'contact@acme-agency.com',
    phone: '+1 (555) 123-4567',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Organization settings updated successfully');
    setIsLoading(false);
  };

  const handleLogoUpload = () => {
    toast.info('Logo upload feature coming soon');
  };

  const handleDeleteOrganization = () => {
    toast.error('Please contact support to delete your organization');
  };

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <Card className="p-6 border border-[#E0E0E0] rounded-lg">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#212121]">
                <Building2 className="h-6 w-6 text-[#2196F3]" />
                Organization Details
              </h3>
              <p className="text-sm text-[#757575] mt-1">
                Update your organization information
              </p>
            </div>
          </div>

          <Separator className="bg-[#E0E0E0]" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-medium text-[#212121]">
                  Organization Name
                </Label>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Agency"
                  className="border-[#E0E0E0] focus:border-[#2196F3] focus:ring-[#2196F3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-website" className="text-sm font-medium text-[#212121]">
                  Website
                </Label>
                <Input
                  id="org-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="border-[#E0E0E0] focus:border-[#2196F3] focus:ring-[#2196F3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-email" className="text-sm font-medium text-[#212121]">
                  Contact Email
                </Label>
                <Input
                  id="org-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="border-[#E0E0E0] focus:border-[#2196F3] focus:ring-[#2196F3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-phone" className="text-sm font-medium text-[#212121]">
                  Phone Number
                </Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="border-[#E0E0E0] focus:border-[#2196F3] focus:ring-[#2196F3]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Organization Logo */}
      <Card className="p-6 border border-[#E0E0E0] rounded-lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#212121]">Organization Logo</h3>
            <p className="text-sm text-[#757575] mt-1">
              Upload your organization logo (recommended: 400×400px)
            </p>
          </div>

          <Separator className="bg-[#E0E0E0]" />

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0] flex items-center justify-center">
              <Building2 className="h-8 w-8 text-[#757575]" />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleLogoUpload}
                className="border-[#E0E0E0] hover:bg-[#E3F2FD] hover:text-[#2196F3] hover:border-[#2196F3]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border border-[#F44336] rounded-lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#F44336]">Danger Zone</h3>
            <p className="text-sm text-[#757575] mt-1">
              Irreversible actions for your organization
            </p>
          </div>

          <Separator className="bg-[#F44336]/20" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#212121]">Delete Organization</p>
              <p className="text-sm text-[#757575]">
                Permanently delete your organization and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              className="bg-[#F44336] hover:bg-[#D32F2F] text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
