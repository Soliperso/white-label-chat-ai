import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsHexColor,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWidgetDto {
  @ApiProperty({ description: 'Widget name', example: 'Support Chat Widget' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Widget description',
    example: 'Customer support widget for homepage',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Widget status',
    enum: ['active', 'draft', 'inactive'],
    default: 'draft',
  })
  @IsEnum(['active', 'draft', 'inactive'])
  @IsOptional()
  status?: 'active' | 'draft' | 'inactive';

  // Branding
  @ApiPropertyOptional({
    description: 'Primary color (hex)',
    example: '#4F46E5',
  })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Accent color (hex)',
    example: '#9333EA',
  })
  @IsHexColor()
  @IsOptional()
  accentColor?: string;

  @ApiPropertyOptional({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Font family',
    example: 'Arial, sans-serif',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fontFamily?: string;

  @ApiPropertyOptional({
    description: 'Hide ChatForge branding',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  whiteLabel?: boolean;

  // Behavior
  @ApiPropertyOptional({
    description: 'Welcome message',
    example: 'Hi! How can I help you today?',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  welcomeMessage?: string;

  @ApiPropertyOptional({
    description: 'Fallback message for low-confidence responses',
    example: "I'm sorry, I don't know how to answer that.",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fallbackMessage?: string;

  @ApiPropertyOptional({
    description: 'Confidence threshold (0-1)',
    example: 0.7,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;

  @ApiPropertyOptional({
    description: 'Collect user email before chat',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  collectEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Show typing indicator',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  showTypingIndicator?: boolean;

  // Widget styling
  @ApiPropertyOptional({
    description: 'Widget position',
    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right',
  })
  @IsEnum(['bottom-right', 'bottom-left', 'top-right', 'top-left'])
  @IsOptional()
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  @ApiPropertyOptional({
    description: 'Button size in pixels',
    example: 60,
  })
  @IsNumber()
  @IsOptional()
  @Min(40)
  @Max(100)
  buttonSize?: number;

  @ApiPropertyOptional({
    description: 'Chat window width in pixels',
    example: 400,
  })
  @IsNumber()
  @IsOptional()
  @Min(300)
  @Max(800)
  chatWindowWidth?: number;

  @ApiPropertyOptional({
    description: 'Chat window height in pixels',
    example: 600,
  })
  @IsNumber()
  @IsOptional()
  @Min(400)
  @Max(1000)
  chatWindowHeight?: number;
}
