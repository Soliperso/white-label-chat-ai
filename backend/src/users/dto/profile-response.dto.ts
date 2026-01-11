import { User } from '../users.service';

/**
 * DTO for user profile API responses
 * Excludes sensitive information
 */
export class ProfileResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profilePictureUrl?: string | null;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  /**
   * Factory method to create ProfileResponseDto from User data
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
