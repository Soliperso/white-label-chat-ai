import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating a user as super admin
 */
export class UpdateUserDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'manager', 'viewer', 'super_admin'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'viewer', 'super_admin'])
  role?: 'admin' | 'manager' | 'viewer' | 'super_admin';

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
