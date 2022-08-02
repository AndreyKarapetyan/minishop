import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@minishop/user/user.module';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';
import { CommonModule } from '@minishop/common/common.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, SessionSerializer],
  exports: [AuthService]
})
export class AuthModule {}
