import { CommonModule } from '@minishop/common/common.module';
import { PrismaModule } from '@minishop/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { UserModule } from '@minishop/user/user.module';

@Module({
  imports: [PrismaModule, CommonModule, UserModule],
  controllers: [],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
