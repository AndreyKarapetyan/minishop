import { AuthenticationGuard } from '@minishop/auth/guards/auth.guard';
import { AuthService } from '@minishop/auth/auth.service';
import { CurrentUser } from '@minishop/auth/decorators/user.decorator';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UserLoginDto } from '@minishop/common/dtos/input/user/user-login.dto';
import { UserSignupDto } from '@minishop/common/dtos/input/user/user-signup.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@minishop/user/user.service';

@Controller()
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('signup')
  async signup(@Body() userData: UserSignupDto, @Req() request: Request) {
    const user = await this.authService.registerUser(userData);
    await new Promise((res) => request.logIn(user, res));
    return request.user;
  }

  @Post('login')
  async login(@Body() userData: UserLoginDto, @Req() request: Request) {
    const { username, password } = userData;
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    await new Promise((res) => request.logIn(user, res));
    const numOfSessions = await this.userService.getNumOfSessions(user.id);
    const message =
      numOfSessions > 1
        ? 'There is already an active session using your account'
        : '';
    const response = { user, message };
    return response;
  }

  @UseGuards(AuthenticationGuard)
  @Get('test')
  async test(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthenticationGuard)
  @Delete('logout')
  async logout(@Req() request: Request) {
    await new Promise((res) => request.session.destroy(res));
    return;
  }

  @UseGuards(AuthenticationGuard)
  @Delete('logout/all')
  async logoutAll(@CurrentUser() user: User) {
    await this.userService.deleteAllSessions(user.id);
    return;
  }
}
