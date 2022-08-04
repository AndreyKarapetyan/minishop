import { UserRole } from '@prisma/client';
import {
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsIn(Object.values(UserRole))
  @IsOptional()
  role?: UserRole;

  @MinLength(8)
  @IsOptional()
  password?: string;
}
