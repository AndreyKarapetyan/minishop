import { CommonModule } from '@minishop/common/common.module';
import { PrismaModule } from '@minishop/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
