import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SupabaseService } from '../auth/supabase.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let supabaseService: SupabaseService;

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

  const mockSupabaseClient = {
    auth: {
      signInWithPassword: jest.fn(),
      admin: {
        updateUserById: jest.fn(),
      },
    },
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', updateDto);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.email).toBe('jane@example.com');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      const partialUpdate = { firstName: 'Jane' };
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', partialUpdate);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    it('should update password successfully with valid current password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: mockUser },
      });
      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        error: null,
        data: { user: mockUser },
      });

      await service.updatePassword('user-123', updatePasswordDto);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockUser.email,
        password: 'oldPassword123',
      });
      expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        { password: 'newPassword456' },
      );
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
        data: null,
      });

      await expect(
        service.updatePassword('user-123', updatePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSupabaseClient.auth.admin.updateUserById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when Supabase update fails', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: mockUser },
      });
      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        error: { message: 'Password update failed' },
        data: null,
      });

      await expect(
        service.updatePassword('user-123', updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePassword('nonexistent', updatePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadProfilePicture', () => {
    const mockFile = {
      originalname: 'avatar.jpg',
      buffer: Buffer.from('fake-image-data'),
    } as Express.Multer.File;

    it('should upload profile picture successfully', async () => {
      const updatedUser = {
        ...mockUser,
        profilePictureUrl: '/uploads/profile-pictures/user-123-123456789.jpg',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.uploadProfilePicture('user-123', mockFile);

      expect(result.profilePictureUrl).toContain('/uploads/profile-pictures/');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete profile picture successfully', async () => {
      const userWithPicture = {
        ...mockUser,
        profilePictureUrl: '/uploads/profile-pictures/old-picture.jpg',
      };
      const updatedUser = { ...mockUser, profilePictureUrl: null };
      mockUserRepository.findOne.mockResolvedValue(userWithPicture);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.deleteProfilePicture('user-123');

      expect(result.profilePictureUrl).toBeNull();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should return user unchanged when no profile picture exists', async () => {
      const userWithoutPicture = { ...mockUser, profilePictureUrl: null };
      mockUserRepository.findOne.mockResolvedValue(userWithoutPicture);

      const result = await service.deleteProfilePicture('user-123');

      expect(result).toEqual(userWithoutPicture);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
