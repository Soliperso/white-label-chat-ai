import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminOrganizationsService } from '../services/admin-organizations.service';
import { SupabaseJwtGuard } from '../../auth/guards/supabase-jwt.guard';
import { SuperAdminGuard } from '../../auth/guards/super-admin.guard';
import { IsSuperAdmin } from '../../auth/decorators/is-super-admin.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/strategies/supabase-jwt.strategy';
import { ListOrganizationsQueryDto } from '../dto/query-params.dto';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

/**
 * AdminOrganizationsController handles platform-wide organization management
 * All routes are super admin only and all actions are audited
 */
@ApiTags('Admin - Organizations')
@ApiBearerAuth()
@Controller('admin/organizations')
@UseGuards(SupabaseJwtGuard, SuperAdminGuard)
export class AdminOrganizationsController {
  constructor(
    private readonly adminOrganizationsService: AdminOrganizationsService,
  ) {}

  @Get()
  @IsSuperAdmin()
  @ApiOperation({ summary: 'List all organizations (super admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all organizations' })
  @ApiResponse({ status: 403, description: 'Access denied - super admin only' })
  async listAllOrganizations(
    @CurrentUser() user: User,
    @Query() query: ListOrganizationsQueryDto,
  ) {
    return this.adminOrganizationsService.getAllOrganizations(user, query);
  }

  @Get('stats')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform-wide organization statistics' })
  async getOrganizationStats(@CurrentUser() user: User) {
    return this.adminOrganizationsService.getOrganizationStats(user);
  }

  @Get(':id')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Returns detailed organization information' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationDetails(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminOrganizationsService.getOrganizationDetails(user, id);
  }

  @Post()
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @CurrentUser() user: User,
    @Body() createDto: CreateOrganizationDto,
  ) {
    return this.adminOrganizationsService.createOrganization(user, createDto);
  }

  @Patch(':id')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateOrganization(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    return this.adminOrganizationsService.updateOrganization(user, id, updateDto);
  }

  @Post(':id/suspend')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Suspend an organization' })
  @ApiResponse({ status: 200, description: 'Organization suspended successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async suspendOrganization(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminOrganizationsService.suspendOrganization(user, id);
  }

  @Post(':id/activate')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Activate a suspended organization' })
  @ApiResponse({ status: 200, description: 'Organization activated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async activateOrganization(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminOrganizationsService.activateOrganization(user, id);
  }
}
