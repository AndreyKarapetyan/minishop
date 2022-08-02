import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { UserSignupDto } from '@minishop/common/dtos/input/user/user-signup.dto';
import { UserService } from '@minishop/user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private saltOrRounds = 10;

  constructor(private readonly userService: UserService) {}

  async registerUser(userData: UserSignupDto): Promise<User> {
    const { username, password, role } = userData;
    const dataToSave = {
      password: await hash(password, this.saltOrRounds),
      username,
      role,
    };
    return this.userService.createUser(dataToSave);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.getUserByUsername(username);
    const isValid = user && (await compare(password, user.password));
    if (isValid) {
      delete user.password;
      return user;
    }
    return null;
  }
}
