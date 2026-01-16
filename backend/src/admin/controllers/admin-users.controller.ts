import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from '../services/admin-users.service';
import { SupabaseJwtGuard } from '../../auth/guards/supabase-jwt.guard';
import { SuperAdminGuard } from '../../auth/guards/super-admin.guard';
import { IsSuperAdmin } from '../../auth/decorators/is-super-admin.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/strategies/supabase-jwt.strategy';
import { ListUsersQueryDto } from '../dto/query-params.dto';
import { UpdateUserDto } from '../dto/user.dto';

/**
 * AdminUsersController handles platform-wide user management
 * All routes are super admin only and all actions are audited
 */
@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(SupabaseJwtGuard, SuperAdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @IsSuperAdmin()
  @ApiOperation({ summary: 'List all users (super admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all users' })
  @ApiResponse({ status: 403, description: 'Access denied - super admin only' })
  async listAllUsers(
    @CurrentUser() user: User,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.adminUsersService.getAllUsers(user, query);
  }

  @Get('stats')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform-wide user statistics' })
  async getUserStats(@CurrentUser() user: User) {
    return this.adminUsersService.getUserStats(user);
  }

  @Get(':id')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'Returns detailed user information' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminUsersService.getUserDetails(user, id);
  }

  @Patch(':id')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateUser(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminUsersService.updateUser(user, id, updateDto);
  }

  @Post(':id/suspend')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Suspend a user account' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot suspend own account' })
  async suspendUser(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminUsersService.suspendUser(user, id);
  }

  @Post(':id/activate')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Activate a suspended user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminUsersService.activateUser(user, id);
  }

  @Post(':id/promote-super-admin')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Promote user to super admin (SECURITY CRITICAL)' })
  @ApiResponse({ status: 200, description: 'User promoted to super admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User is already super admin' })
  @HttpCode(HttpStatus.OK)
  async promoteToSuperAdmin(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.adminUsersService.promoteToSuperAdmin(user, id);
  }

  @Post(':id/impersonate')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Impersonate a user (TODO: Phase 4)' })
  @ApiResponse({ status: 501, description: 'Not yet implemented' })
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  async impersonateUser(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return { message: 'User impersonation will be implemented in Phase 4' };
  }
}
