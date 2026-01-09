'use client';

import { useState, useRef, useEffect } from 'react';
import { Building2, Upload, Trash2, X, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function OrganizationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: 'Acme Agency',
    website: 'https://acme-agency.com',
    email: 'contact@acme-agency.com',
    phone: '+1 (555) 123-4567',
  });

  // Load existing logo from localStorage on mount
  useEffect(() => {
    const storedLogo = localStorage.getItem('organizationLogo');
    if (storedLogo) {
      setLogoPreview(storedLogo);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Organization settings updated successfully');
    setIsLoading(false);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const logoData = reader.result as string;
      setLogoPreview(logoData);
      // Store in localStorage so sidebar can access it
      localStorage.setItem('organizationLogo', logoData);
      // Dispatch custom event to update sidebar immediately
      window.dispatchEvent(new Event('logoUpdated'));
      toast.success('Logo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Remove from localStorage
    localStorage.removeItem('organizationLogo');
    // Dispatch custom event to update sidebar immediately
    window.dispatchEvent(new Event('logoUpdated'));
    toast.success('Logo removed');
  };

  const handleDeleteOrganization = async () => {
    if (deleteConfirmText !== formData.name) {
      toast.error('Please type the organization name to confirm deletion');
      return;
    }

    setIsDeleting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Organization deleted successfully');
    setIsDeleting(false);
    setDeleteConfirmText('');

    // In a real app, you would redirect to a goodbye page or logout
    // router.push('/goodbye');
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
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-semibold text-[#212121] flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#2196F3]" />
              Organization Logo
            </h3>
            <p className="text-sm text-[#757575] mt-1">
              Your logo appears in the chat widget header and represents your brand to customers
            </p>
          </div>

          <Separator className="bg-[#E0E0E0]" />

          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Preview Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-32 w-32 rounded-xl bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] border-2 border-dashed border-[#E0E0E0] flex items-center justify-center overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Organization logo"
                      className="h-full w-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveLogo}
                        className="text-white hover:text-white hover:bg-white/20"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-[#BDBDBD]" />
                    <span className="text-xs text-[#9E9E9E]">No logo</span>
                  </div>
                )}
              </div>
              {logoPreview && (
                <div className="text-center">
                  <span className="text-xs font-medium text-[#4CAF50] bg-[#E8F5E9] px-2 py-1 rounded-full">
                    ✓ Logo uploaded
                  </span>
                </div>
              )}
            </div>

            {/* Upload Actions & Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={handleLogoClick}
                  className="border-[#2196F3] text-[#2196F3] hover:bg-[#E3F2FD] hover:text-[#2196F3] hover:border-[#1976D2]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveLogo}
                    className="border-[#F44336] text-[#F44336] hover:bg-[#FFEBEE] hover:border-[#F44336]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Logo
                  </Button>
                )}
              </div>

              {/* File Info */}
              {logoFile && (
                <div className="bg-[#E3F2FD] p-3 rounded-lg border border-[#2196F3]/20">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-[#212121]">{logoFile.name}</p>
                      <p className="text-xs text-[#757575]">
                        Size: {(logoFile.size / 1024).toFixed(2)} KB • Type: {logoFile.type.split('/')[1].toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guidelines */}
              <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0]">
                <h4 className="text-sm font-semibold text-[#212121] mb-2">Logo Guidelines</h4>
                <ul className="space-y-1.5 text-xs text-[#757575]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-0.5">•</span>
                    <span><strong>Recommended size:</strong> 400×400px (square format works best)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-0.5">•</span>
                    <span><strong>Supported formats:</strong> PNG, JPG, GIF, SVG, WebP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-0.5">•</span>
                    <span><strong>Maximum file size:</strong> 5MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-0.5">•</span>
                    <span><strong>Best practices:</strong> Use transparent background for PNG files, ensure logo is clear at small sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-0.5">•</span>
                    <span><strong>Display:</strong> Logo appears in chat widget header and customer-facing interfaces</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-[#F44336] rounded-lg bg-[#FFEBEE]/30">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-[#F44336] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-semibold text-[#F44336]">Danger Zone</h3>
              <p className="text-sm text-[#757575] mt-1">
                Irreversible actions for your organization
              </p>
            </div>
          </div>

          <Separator className="bg-[#F44336]/30" />

          <div className="flex items-start justify-between gap-4 p-4 bg-white rounded-lg border border-[#F44336]/20">
            <div className="flex-1">
              <p className="font-semibold text-[#212121] mb-1">Delete Organization</p>
              <p className="text-sm text-[#757575]">
                Permanently delete your organization and all associated data including widgets, conversations, and analytics. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-[#F44336] hover:bg-[#D32F2F] text-white flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-2 border-[#F44336] bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-[#F44336] text-xl">
                    <AlertTriangle className="h-6 w-6" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left space-y-3 text-[#212121]">
                    <p className="text-base">This action cannot be undone. This will permanently delete:</p>
                    <ul className="list-disc list-inside space-y-1.5 text-sm ml-2 bg-[#FFEBEE] p-3 rounded-lg">
                      <li className="text-[#212121]">Your organization account</li>
                      <li className="text-[#212121]">All widgets and configurations</li>
                      <li className="text-[#212121]">All conversation history</li>
                      <li className="text-[#212121]">All analytics data</li>
                      <li className="text-[#212121]">All team members access</li>
                    </ul>
                    <div className="pt-2">
                      <p className="font-semibold text-[#F44336] mb-2">
                        Type <span className="font-mono bg-[#FFF3E0] px-2 py-1 rounded border border-[#F44336]">{formData.name}</span> to confirm
                      </p>
                      <Input
                        id="confirm-delete"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={formData.name}
                        className="border-2 border-[#F44336] focus:border-[#D32F2F] focus:ring-[#F44336] bg-white"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="border-[#E0E0E0]"
                    onClick={() => setDeleteConfirmText('')}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOrganization}
                    disabled={isDeleting || deleteConfirmText !== formData.name}
                    className="bg-[#F44336] hover:bg-[#D32F2F] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <span className="mr-2">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Organization
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
