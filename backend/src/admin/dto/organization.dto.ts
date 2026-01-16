import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsHexColor, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating an organization as super admin
 */
export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug (lowercase, alphanumeric, hyphens only)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary brand color (hex)', required: false })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiProperty({ description: 'White label mode (hide platform branding)', required: false })
  @IsOptional()
  @IsBoolean()
  isWhiteLabeled?: boolean;
}

/**
 * DTO for updating an organization as super admin
 */
export class UpdateOrganizationDto {
  @ApiProperty({ description: 'Organization name', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'URL-friendly slug', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary brand color (hex)', required: false })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiProperty({ description: 'White label mode', required: false })
  @IsOptional()
  @IsBoolean()
  isWhiteLabeled?: boolean;

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
