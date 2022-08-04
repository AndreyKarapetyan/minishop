import { UserUpdateDto } from '@minishop/common/dtos/user/user-update.dto';
import { UserSignupDto } from '@minishop/common/dtos/user/user-signup.dto';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { DepositDto } from '@minishop/common/dtos/deposit';

@Injectable()
export class UserService {
  private saltOrRounds = 10;

  constructor(private readonly prisma: PrismaService) { }

  async getUserById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createUser(data: UserSignupDto): Promise<User> {
    const user = await this.prisma.user.create({ data });
    delete user.password;
    return user;
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

  async updateUser(
    id: number,
    userData: Partial<UserUpdateDto & DepositDto>
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
    });
    delete updatedUser.password;
    return updatedUser;
  }

  async deleteUserById(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
