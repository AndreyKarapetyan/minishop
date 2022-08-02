import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(UserRole)
  role: UserRole;

  @MinLength(8)
  password: string;
}
