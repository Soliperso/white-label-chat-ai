import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'viewer',
    profilePictureUrl: null,
    organizationId: 'org-123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockCurrentUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'viewer',
    organizationId: 'org-123',
  };

  const mockUsersService = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    uploadProfilePicture: jest.fn(),
    deleteProfilePicture: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user when found in same organization', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getUser('user-123', 'org-123');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw BadRequestException when accessing user from different organization', async () => {
      const userFromDifferentOrg = { ...mockUser, organizationId: 'org-456' };
      mockUsersService.findById.mockResolvedValue(userFromDifferentOrg);

      await expect(
        controller.getUser('user-123', 'org-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update profile successfully for own user', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        'user-123',
        updateDto,
        mockCurrentUser,
      );

      expect(result).toBeInstanceOf(ProfileResponseDto);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        updateDto,
      );
    });

    it('should allow admin to update any user profile', async () => {
      const adminUser = { ...mockCurrentUser, role: 'admin' };
      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        'other-user-id',
        updateDto,
        adminUser,
      );

      expect(result).toBeInstanceOf(ProfileResponseDto);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        'other-user-id',
        updateDto,
      );
    });

    it('should throw BadRequestException when non-admin tries to update another user', async () => {
      await expect(
        controller.updateProfile('other-user-id', updateDto, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    it('should update password successfully for own user', async () => {
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const result = await controller.updatePassword(
        'user-123',
        updatePasswordDto,
        mockCurrentUser,
      );

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-123',
        updatePasswordDto,
      );
    });

    it('should throw BadRequestException when trying to update another user password', async () => {
      await expect(
        controller.updatePassword(
          'other-user-id',
          updatePasswordDto,
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });

    it('should not allow admin to change another user password', async () => {
      const adminUser = { ...mockCurrentUser, role: 'admin' };

      await expect(
        controller.updatePassword('other-user-id', updatePasswordDto, adminUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('uploadProfilePicture', () => {
    const mockFile = {
      originalname: 'avatar.jpg',
      buffer: Buffer.from('fake-image-data'),
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    it('should upload profile picture successfully for own user', async () => {
      const updatedUser = {
        ...mockUser,
        profilePictureUrl: '/uploads/profile-pictures/user-123.jpg',
      };
      mockUsersService.uploadProfilePicture.mockResolvedValue(updatedUser);

      const result = await controller.uploadProfilePicture(
        'user-123',
        mockFile,
        mockCurrentUser,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.uploadProfilePicture).toHaveBeenCalledWith(
        'user-123',
        mockFile,
      );
    });

    it('should throw BadRequestException when file is missing', async () => {
      await expect(
        controller.uploadProfilePicture('user-123', null as any, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when non-admin tries to upload for another user', async () => {
      await expect(
        controller.uploadProfilePicture('other-user-id', mockFile, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.uploadProfilePicture).not.toHaveBeenCalled();
    });

    it('should allow admin to upload profile picture for any user', async () => {
      const adminUser = { ...mockCurrentUser, role: 'admin' };
      const updatedUser = {
        ...mockUser,
        profilePictureUrl: '/uploads/profile-pictures/other-user.jpg',
      };
      mockUsersService.uploadProfilePicture.mockResolvedValue(updatedUser);

      const result = await controller.uploadProfilePicture(
        'other-user-id',
        mockFile,
        adminUser,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.uploadProfilePicture).toHaveBeenCalledWith(
        'other-user-id',
        mockFile,
      );
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete profile picture successfully for own user', async () => {
      const updatedUser = { ...mockUser, profilePictureUrl: null };
      mockUsersService.deleteProfilePicture.mockResolvedValue(updatedUser);

      const result = await controller.deleteProfilePicture(
        'user-123',
        mockCurrentUser,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.deleteProfilePicture).toHaveBeenCalledWith(
        'user-123',
      );
    });

    it('should throw BadRequestException when non-admin tries to delete another user picture', async () => {
      await expect(
        controller.deleteProfilePicture('other-user-id', mockCurrentUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.deleteProfilePicture).not.toHaveBeenCalled();
    });

    it('should allow admin to delete any user profile picture', async () => {
      const adminUser = { ...mockCurrentUser, role: 'admin' };
      const updatedUser = { ...mockUser, profilePictureUrl: null };
      mockUsersService.deleteProfilePicture.mockResolvedValue(updatedUser);

      const result = await controller.deleteProfilePicture(
        'other-user-id',
        adminUser,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.deleteProfilePicture).toHaveBeenCalledWith(
        'other-user-id',
      );
    });
  });
});
