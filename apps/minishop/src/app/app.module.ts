import { CommonModule } from '@minishop/common/common.module';
import { Module } from '@nestjs/common';
import { AuthModule } from '@minishop/auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UserModule } from '@minishop/user/user.module';

@Module({
  imports: [AuthModule, CommonModule, UserModule],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}
