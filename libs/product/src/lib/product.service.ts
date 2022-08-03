import { PurchaseDto } from '@minishop/common/dtos/purchase.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { Product, User } from '@prisma/client';
import { ProductCreateDto } from '@minishop/common/dtos/product/product-create.dto';
import { ProductUpdateDto } from '@minishop/common/dtos/product/product-update.dto';
import { UserService } from '@minishop/user/user.service';
import { COINS } from '@minishop/common/types';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

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

  async buyProduct(purchaseData: PurchaseDto, user: User, product: Product) {
    const { amount } = purchaseData;
    const userNewDeposit = user.deposit - amount * product.cost;
    const leftAmount = product.amountAvailable - amount;
    await this.userService.updateUser(user.id, { deposit: userNewDeposit });
    const updatedProduct = await this.prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        amountAvailable: leftAmount,
      },
    });
    let money = userNewDeposit;
    const change = [];
    const coins = Object.values(COINS).sort((v1: number, v2: number) => v2 - v1) as COINS[];
    for (let i = 0; i < coins.length && money > 0; i++) {
      if (money >= coins[i]) {
        const count = Math.floor(money / coins[i]);
        money -= coins[i] * count;
        change.push(...new Array(count).fill(coins[i]));
      }
    }
    const totalSpent = amount * product.cost;
    return {
      change,
      totalSpent,
      product: updatedProduct,
    };
  }
}
