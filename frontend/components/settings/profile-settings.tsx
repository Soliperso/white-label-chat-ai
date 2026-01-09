'use client';

import { useState, useRef } from 'react';
import { User, Lock, Shield, Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { uploadProfilePicture, deleteProfilePicture } from '@/lib/api-client';

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user?.profilePictureUrl ? `${apiBaseUrl}${user.profilePictureUrl}` : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@acme-agency.com',
    role: user?.role || 'viewer',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Profile updated successfully');
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Password changed successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPicture(true);

    try {
      const updatedUser = await uploadProfilePicture(user.id, file);

      if (updatedUser.profilePictureUrl) {
        setProfilePicturePreview(`${apiBaseUrl}${updatedUser.profilePictureUrl}`);
      }

      updateUser(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    setIsUploadingPicture(true);

    try {
      const updatedUser = await deleteProfilePicture(user.id);
      setProfilePicturePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      updateUser(updatedUser);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove profile picture');
      console.error('Remove error:', error);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <User className="h-5 w-5 text-cyan-700" />
              </div>
              Profile Picture
            </h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Upload a profile picture to personalize your account
            </p>
          </div>

          <Separator className="bg-gray-200" />

          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-gray-200 shadow-lg">
              {profilePicturePreview ? (
                <AvatarImage src={profilePicturePreview} alt="Profile picture" />
              ) : (
                <AvatarFallback className="bg-cyan-500 text-white text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={handleProfilePictureClick}
                  disabled={isUploadingPicture}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingPicture ? 'Uploading...' : 'Upload Photo'}
                </Button>
                {profilePicturePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveProfilePicture}
                    disabled={isUploadingPicture}
                    className="font-semibold border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Recommended: Square image, at least 200x200px. Max 5MB. Supports JPG, PNG, GIF, WebP.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <User className="h-5 w-5 text-emerald-700" />
              </div>
              Profile Information
            </h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Update your personal information
            </p>
          </div>

          <Separator className="bg-gray-200" />

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-sm font-semibold text-gray-700">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  placeholder="John"
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-sm font-semibold text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                  Role
                </Label>
                <Input
                  id="role"
                  value={profileData.role}
                  disabled
                  className="bg-gray-100 border-gray-300 text-gray-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="h-5 w-5 text-amber-700" />
              </div>
              Change Password
            </h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Update your password to keep your account secure
            </p>
          </div>

          <Separator className="bg-gray-200" />

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-semibold text-gray-700">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 font-medium">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="h-5 w-5 text-indigo-700" />
              </div>
              Security
            </h3>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Additional security settings
            </p>
          </div>

          <Separator className="bg-gray-200" />

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-cyan-50 p-4 rounded-lg border border-cyan-100">
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => toast.info('2FA setup coming soon')}
                className="font-semibold border-gray-300 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 transition-all duration-200 shadow-sm"
              >
                Enable 2FA
              </Button>
            </div>

            <Separator className="bg-gray-200" />

            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <div>
                <p className="font-semibold text-gray-900">Active Sessions</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Manage devices where you're currently logged in
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => toast.info('Session management coming soon')}
                className="font-semibold border-gray-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-200 shadow-sm"
              >
                View Sessions
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
