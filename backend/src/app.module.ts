import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrainingModule } from './training/training.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { WidgetsModule } from './widgets/widgets.module';
import { AdminModule } from './admin/admin.module';
import { SupabaseJwtGuard } from './auth/guards/supabase-jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SuperAdminGuard } from './auth/guards/super-admin.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrainingModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    WidgetsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SupabaseJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SuperAdminGuard,
    },
  ],
})
export class AppModule {}
