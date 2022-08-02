import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@minishop/user/user.module';
import { SessionSerializer } from './session.serializer';
import { CommonModule } from '@minishop/common/common.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    PassportModule.register({ session: true }),
  ],
  providers: [SessionSerializer],
  exports: [],
})
export class AuthModule {}
