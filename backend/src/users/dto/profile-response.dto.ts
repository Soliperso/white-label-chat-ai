import { User } from '../entities/user.entity';

/**
 * DTO for user profile API responses
 * Excludes sensitive information
 */
export class ProfileResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  profilePictureUrl: string | null;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Factory method to create ProfileResponseDto from User entity
   */
  static fromEntity(user: User): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.role = user.role;
    dto.profilePictureUrl = user.profilePictureUrl;
    dto.organizationId = user.organizationId;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
