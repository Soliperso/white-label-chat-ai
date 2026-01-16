import { IsOptional, IsString, IsInt, IsBoolean, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Base query parameters for pagination
 */
export class PaginationQueryDto {
  @ApiProperty({ description: 'Number of items per page', default: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiProperty({ description: 'Number of items to skip', default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * Query parameters for listing organizations
 */
export class ListOrganizationsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Search organizations by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Query parameters for listing users
 */
export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Search users by email or name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by role', enum: ['admin', 'manager', 'viewer', 'super_admin'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'viewer', 'super_admin'])
  role?: string;

  @ApiProperty({ description: 'Filter by organization ID', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Query parameters for audit logs
 */
export class ListAuditLogsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Filter by super admin ID', required: false })
  @IsOptional()
  @IsString()
  superAdminId?: string;

  @ApiProperty({ description: 'Filter by action type', required: false })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiProperty({ description: 'Filter by organization ID', required: false })
  @IsOptional()
  @IsString()
  targetOrganizationId?: string;

  @ApiProperty({ description: 'Filter by resource type', required: false })
  @IsOptional()
  @IsString()
  targetResourceType?: string;

  @ApiProperty({ description: 'Start date (ISO 8601)', required: false })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ description: 'End date (ISO 8601)', required: false })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
