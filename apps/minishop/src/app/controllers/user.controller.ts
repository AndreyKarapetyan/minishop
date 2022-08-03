import { AuthenticationGuard } from '@minishop/auth/guards/auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UserLoginDto } from '@minishop/common/dtos/user/user-login.dto';
import { UserService } from '@minishop/user/user.service';
import { UserSignupDto } from '@minishop/common/dtos/user/user-signup.dto';
import { UserUpdateDto } from '@minishop/common/dtos/user/user-update.dto';
import {
  Body,
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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() userData: UserSignupDto, @Req() request: Request) {
    const existing = await this.userService.getUserByUsername(
      userData.username
    );
    if (existing) {
      throw new NotAcceptableException('This username is already taken');
    }
    const user = await this.userService.createUser(userData);
    await new Promise((resolve) => request.logIn(user, resolve));
    return request.user;
  }

  @Post('login')
  async login(@Body() userData: UserLoginDto, @Req() request: Request) {
    const { username, password } = userData;
    const user = await this.userService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    await new Promise((resolve) => request.logIn(user, resolve));
    const numOfSessions = await this.userService.getNumOfSessions(user.id);
    const message =
      numOfSessions > 1
        ? 'There is already an active session using your account'
        : '';
    const response = { user, message };
    return response;
  }

  @UseGuards(AuthenticationGuard)
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthenticationGuard)
  @Put('me')
  async updateMe(@Body() userData: UserUpdateDto, @CurrentUser() user: User) {
    if (userData.username && userData.username !== user.username) {
      const existing = await this.userService.getUserByUsername(
        userData.username
      );
      if (existing) {
        throw new NotAcceptableException('This username is already taken');
      }
    }
    const updatedUser = await this.userService.updateUser(user.id, userData);
    return updatedUser;
  }

  @UseGuards(AuthenticationGuard)
  @Delete('me')
  async deleteMe(@CurrentUser() user: User) {
    await this.userService.deleteAllSessions(user.id);
    await this.userService.deleteUserById(user.id);
    return;
  }

  @UseGuards(AuthenticationGuard)
  @Delete('logout')
  async logout(@Req() request: Request) {
    await new Promise((resolve) => request.session.destroy(resolve));
    return;
  }

  @UseGuards(AuthenticationGuard)
  @Delete('logout/all')
  async logoutAll(@CurrentUser() user: User) {
    await this.userService.deleteAllSessions(user.id);
    return;
  }
}
