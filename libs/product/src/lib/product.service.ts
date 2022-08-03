import { Injectable } from '@nestjs/common';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { Product } from '@prisma/client';
import { ProductCreateDto } from '@minishop/common/dtos/product/product-create.dto';
import { ProductUpdateDto } from '@minishop/common/dtos/product/product-update.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(
    productData: ProductCreateDto,
    sellerId: number
  ): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...productData,
        sellerId,
      },
    });
  }

  async getProductById(id: number): Promise<Product> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async deleteProductById(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async updateProductById(
    data: ProductUpdateDto,
    id: number
  ): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }
}
