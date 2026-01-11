import { IsString, MinLength, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating user password via Supabase
 */
export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Current password must be at least 8 characters long' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}
