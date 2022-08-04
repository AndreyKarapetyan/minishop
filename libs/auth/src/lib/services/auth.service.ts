import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { DepositDto } from '@minishop/common/dtos/deposit';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenDto } from '@minishop/common/dtos/token.dto';
import { UserLoginDto } from '@minishop/common/dtos/user/user-login.dto';
import { UserService } from '@minishop/user/user.service';
import { UserSignupDto } from '@minishop/common/dtos/user/user-signup.dto';
import { UserUpdateDto } from '@minishop/common/dtos/user/user-update.dto';
import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  private saltOrRounds = 10;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  public async signUp(userData: UserSignupDto) {
    const existingUser = await this.userService.getUserByUsername(
      userData.username
    );
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
    await this.addToCache(accessToken, user.id);
    delete user.password;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async updateUser(
    id: number,
    userData: Partial<UserUpdateDto & DepositDto>
  ) {
    let hashedPassword: string;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, this.saltOrRounds);
    }
    return this.userService.updateUser(id, {
      ...userData,
      password: hashedPassword,
    });
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
    await this.addToCache(accessToken, user.id);
    let message = '';
    const sessions = await this.cacheManager.store.keys(`${user.id}-*`);
    if (sessions.length > 1) {
      message = 'There is already an active session using your account';
    }
    delete user.password;
    return {
      user,
      accessToken,
      refreshToken,
      message,
    };
  }

  public async deleteToken(accessToken: string): Promise<void> {
    const mainKey = await this.cacheManager.get(accessToken);
    await this.cacheManager.del(accessToken);
    if (typeof mainKey === 'string') {
      await this.cacheManager.del(mainKey);
    }
  }

  public async deleteAllTokens(userId: number): Promise<void> {
    const keys = await this.cacheManager.store.keys(`${userId}-*`);
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }

  public async refreshToken(tokenData: TokenDto) {
    try {
      const { userId } = this.jwtService.verify(tokenData.refreshToken);
      const user = await this.userService.getUserById(userId);
      delete user.password;
      const { accessToken, refreshToken } = this.generateToken({
        userId,
      });
      await this.addToCache(accessToken, user.id);
      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  public getTokenFromRequest(req: Request): string {
    return req.headers['authorization'].split(' ')[1];
  }

  private async addToCache(accessToken: string, userId: number): Promise<void> {
    const mainKey = `${userId}-${Date.now()}`;
    await this.cacheManager.set(accessToken, mainKey);
    await this.cacheManager.set(mainKey, true);
  }

  private generateToken(payload: { userId: string }) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_IN,
    });
    return { accessToken, refreshToken };
  }
}
