import { JwtAuthGuard } from '@minishop/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { DepositDto } from '@minishop/common/dtos/deposit';
import { Request } from 'express';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '@minishop/auth/guards/role.guard';
import { User, UserRole } from '@prisma/client';
import { UserLoginDto } from '@minishop/common/dtos/user/user-login.dto';
import { UserService } from '@minishop/user/user.service';
import { UserSignupDto } from '@minishop/common/dtos/user/user-signup.dto';
import { UserUpdateDto } from '@minishop/common/dtos/user/user-update.dto';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@minishop/auth/services/auth.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

  @Post('signup')
  async signUp(@Body() userData: UserSignupDto) {
    const existingUser = await this.userService.getUserByUsername(userData.username);
    if (existingUser) {
      throw new ConflictException('User with this email exists');
    }
    return this.authService.signUp(userData);
  }

  @Post('login')
  async login(@Body() signInData: UserLoginDto) {
    return this.authService.login(signInData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Body() userData: UserUpdateDto, @CurrentUser() user: User) {
    if (userData.username && userData.username !== user.username) {
      const existing = await this.userService.getUserByUsername(
        userData.username
      );
      if (existing) {
        throw new ConflictException('This username is already taken');
      }
    }
    const updatedUser = await this.authService.updateUser(user.id, userData);
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Buyer)
  @Put('deposit')
  async deposit(@Body() depositData: DepositDto, @CurrentUser() user: User) {
    const deposit = user.deposit + depositData.deposit;
    const updatedUser = await this.userService.updateUser(user.id, { deposit });
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Buyer)
  @Put('reset')
  async resetDeposit(@CurrentUser() user: User) {
    const updatedUser = await this.userService.updateUser(user.id, {
      deposit: 0,
    });
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@CurrentUser() user: User) {
    // await this.userService.deleteAllSessions(user.id);
    await this.userService.deleteUserById(user.id);
    return;
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete('logout')
  // async logout(@Req() request: Request) {
  //   await new Promise((resolve) => request.session.destroy(resolve));
  //   return;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('logout/all')
  // async logoutAll(@CurrentUser() user: User) {
  //   await this.userService.deleteAllSessions(user.id);
  //   return;
  // }
}
