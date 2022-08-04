import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '@minishop/common/dtos/token.dto';
import { UserService } from '@minishop/user/user.service';
import { UserLoginDto } from '@minishop/common/dtos/user/user-login.dto';
import { UserSignupDto } from '@minishop/common/dtos/user/user-signup.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserUpdateDto } from '@minishop/common/dtos/user/user-update.dto';
import { DepositDto } from '@minishop/common/dtos/deposit';

@Injectable()
export class AuthService {
  private saltOrRounds = 10;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) { }

  public async signUp(userData: UserSignupDto) {
    const existingUser = await this.userService.getUserByUsername(userData.username);
    if (existingUser) {
      throw new ConflictException('User with this email exists');
    }
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltOrRounds
    );
    const user = await this.userService.createUser({
      ...userData,
      password: hashedPassword,
    });
    const { accessToken, refreshToken } = this.generateToken({
      userId: user.id.toString(),
    });
    delete user.password;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async updateUser(id: number,
    userData: Partial<UserUpdateDto & DepositDto>) {
    let hashedPassword: string;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, this.saltOrRounds);
    }
    return this.userService.updateUser(id, { ...userData, password: hashedPassword })
  }

  public async login(loginData: UserLoginDto) {
    const { password, username } = loginData;
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException("Specified user doesn't exist");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new NotFoundException("Specified user doesn't exist");
    }
    const { accessToken, refreshToken } = this.generateToken({
      userId: user.id.toString(),
    });
    delete user.password;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(tokenData: TokenDto) {
    try {
      const { userId } = this.jwtService.verify(tokenData.refreshToken);
      const user = await this.userService.getUserById(userId);
      delete user.password;
      const { accessToken, refreshToken } = this.generateToken({
        userId,
      });
      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private generateToken(payload: { userId: string }) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_IN,
    });
    return { accessToken, refreshToken };
  }
}
