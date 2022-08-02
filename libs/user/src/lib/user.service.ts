import { UserSignupDto } from '@minishop/common/dtos/input/user/user-signup.dto';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createUser(data: UserSignupDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async getNumOfSessions(userId: number): Promise<number> {
    return this.prisma.session.count({
      where: {
        id: {
          startsWith: `${userId}-`,
        },
      },
    });
  }

  async deleteAllSessions(userId: number): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        id: {
          startsWith: `${userId}-`,
        },
      },
    });
  }
}
