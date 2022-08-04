import { ExtractJwt, Strategy } from 'passport-jwt';
import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { UserService } from '@minishop/user/user.service';
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, 
    private readonly userService: UserService, 
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: { userId: string }): Promise<User> {
    const rawToken = this.authService.getTokenFromRequest(req);
    const userKey = await this.cacheManager.get(rawToken);
    const isValid = userKey && (await this.cacheManager.get(userKey as string));
    if (!isValid) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.getUserById(Number(payload.userId));
    delete user.password;
    return user;
  }
}
