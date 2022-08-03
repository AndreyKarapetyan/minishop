import { CommonModule } from '@minishop/common/common.module';
import { Module } from '@nestjs/common';
import { AuthModule } from '@minishop/auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UserModule } from '@minishop/user/user.module';
import { ProductController } from './controllers/product.controller';
import { ProductModule } from '@minishop/product/product.module';

@Module({
  imports: [AuthModule, CommonModule, UserModule, ProductModule],
  controllers: [UserController, ProductController],
  providers: [],
})
export class AppModule {}
