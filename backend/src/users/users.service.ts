import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (updateProfileDto.firstName) {
      user.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName) {
      user.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.email) {
      user.email = updateProfileDto.email;
    }

    return this.userRepository.save(user);
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findById(userId);

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

    user.profilePictureUrl = `/uploads/profile-pictures/${filename}`;
    return this.userRepository.save(user);
  }

  async deleteProfilePicture(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (user.profilePictureUrl) {
      const filePath = path.join(process.cwd(), user.profilePictureUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete profile picture:', error);
      }

      user.profilePictureUrl = null;
      return this.userRepository.save(user);
    }

    return user;
  }
}
