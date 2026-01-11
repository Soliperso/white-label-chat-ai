import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SupabaseService } from '../auth/supabase.service';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  organizationId: string;
  isActive: boolean;
  profilePictureUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }
    return user as User;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updateProfileDto.firstName !== undefined) {
      updateData.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.email !== undefined) {
      updateData.email = updateProfileDto.email;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      throw new BadRequestException('Failed to update profile');
    }

    return user as User;
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findById(userId);
    const supabase = this.supabaseService.getClient();

    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileExtension = path.extname(file.originalname);
    const filename = `${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    if (user.profilePictureUrl) {
      const oldFilePath = path.join(process.cwd(), user.profilePictureUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Failed to delete old profile picture:', error);
      }
    }

    const profilePictureUrl = `/uploads/profile-pictures/${filename}`;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ profilePictureUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error || !updatedUser) {
      throw new BadRequestException('Failed to update profile picture');
    }

    return updatedUser as User;
  }

  async deleteProfilePicture(userId: string): Promise<User> {
    const user = await this.findById(userId);
    const supabase = this.supabaseService.getClient();

    if (user.profilePictureUrl) {
      const filePath = path.join(process.cwd(), user.profilePictureUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete profile picture:', error);
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ profilePictureUrl: null })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        throw new BadRequestException('Failed to delete profile picture');
      }

      return updatedUser as User;
    }

    return user;
  }

  /**
   * Update user password via Supabase authentication
   * Verifies current password before allowing change
   */
  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.findById(userId);

    // Get Supabase admin client
    const supabase = this.supabaseService.getClient();

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: updatePasswordDto.currentPassword,
    });

    if (signInError) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: updatePasswordDto.newPassword },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to update password: ${updateError.message}`,
      );
    }
  }
}
