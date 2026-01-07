import {
  IsEnum,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateTrainingSourceDto {
  @IsEnum(['url', 'file', 'qna'])
  sourceType: string;

  @ValidateIf((o) => o.sourceType === 'url')
  @IsUrl()
  url?: string;

  @ValidateIf((o) => o.sourceType === 'url')
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  crawlDepth?: number;

  @ValidateIf((o) => o.sourceType === 'qna')
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  question?: string;

  @ValidateIf((o) => o.sourceType === 'qna')
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  answer?: string;
}
