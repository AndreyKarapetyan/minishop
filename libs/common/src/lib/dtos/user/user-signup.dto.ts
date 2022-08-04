import { UserRole } from '@prisma/client';
import { IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsIn(Object.values(UserRole))
  role: UserRole;

  @MinLength(8)
  password: string;
}
