import { UserRole } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @MinLength(8)
  @IsOptional()
  password?: string;
}
