import { CommonModule } from '@minishop/common/common.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@minishop/prisma/prisma.module';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
