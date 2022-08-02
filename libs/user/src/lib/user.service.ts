import { UserUpdateDto } from '@minishop/common/dtos/input/user/user-update.dto';
import { UserSignupDto } from '@minishop/common/dtos/input/user/user-signup.dto';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  private saltOrRounds = 10;

  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createUser(userData: UserSignupDto): Promise<User> {
    const hashedPassword = await hash(userData.password, this.saltOrRounds);
    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    const isValid = user && (await compare(password, user.password));
    if (isValid) {
      delete user.password;
      return user;
    }
    return null;
  }

  async updateUser(id: number, userData: UserUpdateDto): Promise<void> {
    let hashedPassword: string;
    if (userData.password) {
      hashedPassword = await hash(userData.password, this.saltOrRounds);
    }
    await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
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

  async deleteUserById(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
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
