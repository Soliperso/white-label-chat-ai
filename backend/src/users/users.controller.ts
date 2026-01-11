import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Roles('admin', 'manager', 'viewer')
  async getUser(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const user = await this.usersService.findById(id);

    // Ensure user can only access users from their organization
    if (user.organizationId !== organizationId) {
      throw new BadRequestException('Cannot access user from different organization');
    }

    return user;
  }

  @Patch(':id/profile')
  @Roles('admin', 'manager', 'viewer')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() currentUser: any,
  ): Promise<ProfileResponseDto> {
    // Users can only update their own profile unless they're admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('You can only update your own profile');
    }

    const user = await this.usersService.updateProfile(id, updateProfileDto);
    return ProfileResponseDto.fromEntity(user);
  }

  @Post(':id/profile-picture')
  @Roles('admin', 'manager', 'viewer')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Users can only update their own profile picture unless they're admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('You can only update your own profile picture');
    }

    const user = await this.usersService.uploadProfilePicture(id, file);
    return user;
  }

  @Delete(':id/profile-picture')
  @Roles('admin', 'manager', 'viewer')
  async deleteProfilePicture(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    // Users can only delete their own profile picture unless they're admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('You can only delete your own profile picture');
    }

    const user = await this.usersService.deleteProfilePicture(id);
    return user;
  }

  @Patch(':id/password')
  @Roles('admin', 'manager', 'viewer')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    // Users can only update their own password
    if (currentUser.id !== id) {
      throw new BadRequestException('You can only update your own password');
    }

    await this.usersService.updatePassword(id, updatePasswordDto);
    return { message: 'Password updated successfully' };
  }
}
