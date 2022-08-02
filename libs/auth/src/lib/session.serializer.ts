import { UserService } from '@minishop/user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  };

  serializeUser(user: User, done: (err: Error, user: number) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    userId: number,
    done: (err: Error, payload: User) => void
  ): Promise<void> {
    const user = await this.userService.getUserById(Number(userId));
    done(null, user);
  }
}
